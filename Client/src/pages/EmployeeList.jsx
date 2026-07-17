import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Key,
  FileText,
  UserCheck,
  UserCircle,
  Briefcase,
  Calendar,
  LogOut,
  AlertCircle,
  FileSpreadsheet,
  File,
  Trash2,
  Edit,
  CheckSquare,
  Square,
} from "lucide-react";
import employeeService from "../services/employeeService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterField, setFilterField] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const itemsPerPage = 10;

  const headers = [
    { key: "epf", label: "EPF", icon: Key },
    { key: "uan", label: "UAN", icon: FileText },
    { key: "ppo", label: "PPO", icon: UserCheck },
    { key: "name", label: "Name", icon: User },
    { key: "father", label: "Father", icon: UserCircle },
    { key: "designation", label: "Designation", icon: Briefcase },
    { key: "livingDate", label: "Living Date", icon: Calendar },
    { key: "exitDate", label: "Exit Date", icon: LogOut },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeService.getAll();
      setEmployees(
        Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [],
      );
    } catch (err) {
      setError("Failed to load data.");
      toast.error("Failed to load employee data.");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return employees.filter((emp) => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase().trim();
      if (filterField === "all") {
        return emp.some((field) =>
          String(field || "")
            .toLowerCase()
            .includes(searchLower),
        );
      }
      const fieldIndex = headers.findIndex((h) => h.key === filterField);
      return String(emp[fieldIndex] || "")
        .toLowerCase()
        .includes(searchLower);
    });
  }, [employees, searchTerm, filterField]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const index = headers.findIndex((h) => h.key === sortConfig.key);
    return [...filteredData].sort((a, b) => {
      const aVal = String(a[index] || "").toLowerCase();
      const bVal = String(b[index] || "").toLowerCase();
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Get the actual index in the original filtered/sorted array
  const getOriginalIndex = (pageIndex) => {
    return (currentPage - 1) * itemsPerPage + pageIndex;
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle individual checkbox selection
  const handleSelectEmployee = (index) => {
    const originalIndex = getOriginalIndex(index);
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(originalIndex)) {
      newSelected.delete(originalIndex);
    } else {
      newSelected.add(originalIndex);
    }
    setSelectedEmployees(newSelected);
  };

  // Handle select all on current page
  const handleSelectAll = () => {
    const newSelected = new Set(selectedEmployees);
    const currentPageIndices = paginatedData.map((_, idx) => getOriginalIndex(idx));
    
    // Check if all current page items are selected
    const allSelected = currentPageIndices.every(idx => newSelected.has(idx));
    
    if (allSelected) {
      // Deselect all current page items
      currentPageIndices.forEach(idx => newSelected.delete(idx));
    } else {
      // Select all current page items
      currentPageIndices.forEach(idx => newSelected.add(idx));
    }
    setSelectedEmployees(newSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) {
      toast.warning("Please select at least one employee to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedEmployees.size} employee(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const selectedIds = Array.from(selectedEmployees).map(
        index => employees[index]?.[0] // Assuming EPF is the first column and is the ID
      );

      // Delete employees one by one or in bulk based on your API
      for (const id of selectedIds) {
        if (id) {
          await employeeService.delete(id);
        }
      }

      toast.success(`${selectedEmployees.size} employee(s) deleted successfully!`);
      setSelectedEmployees(new Set());
      await fetchEmployees();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete selected employees");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle single delete
  const handleSingleDelete = async (employeeId, index) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await employeeService.delete(employeeId);
      toast.success("Employee deleted successfully!");
      
      // Remove from selection if present
      const newSelected = new Set(selectedEmployees);
      newSelected.delete(index);
      setSelectedEmployees(newSelected);
      
      await fetchEmployees();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete employee");
    }
  };

  // Handle edit - opens edit modal or navigates to edit page
  const handleEdit = (employeeId) => {
    // Option 1: Navigate to edit page
    // navigate(`/employees/edit/${employeeId}`);
    
    // Option 2: Open edit modal
    setEditingEmployee(employeeId);
    // You can implement a modal component here
    toast.info(`Editing employee with ID: ${employeeId}`);
  };

  // Excel Export Handler (unchanged)
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.warning("No data to export");
      return;
    }

    try {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB");
      const formattedTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const generationDateTime = `${formattedDate} ${formattedTime}`;

      const excelData = filteredData.map((row, index) => {
        const obj = { "S.No": index + 1 };
        headers.forEach((h, i) => {
          obj[h.label] = row[i] || "N/A";
        });
        return obj;
      });

      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [[`Report Generated On: ${generationDateTime}`]],
        { origin: "A1" },
      );
      XLSX.utils.sheet_add_json(worksheet, excelData, { origin: "A3" });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

      const colWidths = {};
      Object.keys(excelData[0] || {}).forEach((key) => {
        let maxLen = key.length;
        excelData.forEach((row) => {
          const val = String(row[key] || "");
          maxLen = Math.max(maxLen, val.length);
        });
        colWidths[key] = Math.min(maxLen, 50);
      });
      worksheet["!cols"] = Object.values(colWidths).map((w) => ({ wch: w }));

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      const fileDate = now.toISOString().split("T")[0];
      const fileTime = now.toTimeString().split(" ")[0].replace(/:/g, "-");

      saveAs(blob, `Employees_List_${fileDate}_${fileTime}.xlsx`);
      toast.success("Excel exported successfully!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export Excel");
    }
  };

  // PDF Export Handler (unchanged)
  const handleExportPDF = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.warning("No data to export!");
      return;
    }

    try {
      const displayListName = "Employee List Report";

      const hasLongContent = filteredData.some(
        (row) =>
          (row[3] && row[3].length > 25) ||
          (row[1] && row[1].length > 15),
      );

      const dynamicOrientation = hasLongContent ? "landscape" : "portrait";
      const doc = new jsPDF({ orientation: dynamicOrientation });

      const generatedDate = new Date().toLocaleDateString();
      const generatedTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const totalRecords = filteredData.length;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text(displayListName.toUpperCase(), 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);

      const pageWidth =
        doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      const rightMargin = pageWidth - 14;

      doc.text(`Generated On: ${generatedDate} | ${generatedTime}`, 14, 22);
      doc.text(`Total Records: ${totalRecords}`, rightMargin, 22, {
        align: "right",
      });

      doc.setDrawColor(220, 220, 220);
      doc.line(14, 25, rightMargin, 25);

      const tableColumn = ["S.No", ...headers.map((h) => h.label)];
      const tableRows = filteredData.map((row, index) => [
        index + 1,
        ...row.map((val) => val || "N/A"),
      ]);

      let dynamicFontSize = dynamicOrientation === "portrait" ? 6.5 : 7.5;
      let maxNameLength = 0;
      let maxUANLength = 0;

      filteredData.forEach((row) => {
        if (row[3] && row[3].length > maxNameLength)
          maxNameLength = row[3].length;
        if (row[1] && row[1].length > maxUANLength)
          maxUANLength = row[1].length;
      });

      if (maxNameLength > 30 || maxUANLength > 35) {
        dynamicFontSize = 5.5;
      } else if (maxNameLength > 20 || maxUANLength > 25) {
        dynamicFontSize = 6;
      } else if (maxNameLength > 15 || maxUANLength > 20) {
        dynamicFontSize = 6.5;
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: "striped",
        styles: {
          fontSize: dynamicFontSize,
          cellPadding: dynamicFontSize < 6 ? 1.5 : 2,
          overflow: "linebreak",
          valign: "middle",
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          fontSize: dynamicFontSize + 0.5,
          cellPadding: dynamicFontSize < 6 ? 2 : 2.5,
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255],
        },
        tableWidth: "auto",
        columnStyles: {
          0: { halign: "center", cellWidth: dynamicFontSize < 6 ? 7 : 9 },
          1: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
          2: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
          3: { cellWidth: "auto" },
          4: { cellWidth: "auto" },
          5: { cellWidth: "auto" },
          6: { halign: "center", cellWidth: dynamicFontSize < 6 ? 18 : 22 },
          7: { halign: "center", cellWidth: dynamicFontSize < 6 ? 16 : 20 },
          8: { halign: "center", cellWidth: dynamicFontSize < 6 ? 16 : 20 },
        },
        margin: { left: 8, right: 8 },
      });

      const sanitizedListName = displayListName
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      doc.save(`${sanitizedListName}_${new Date().getTime()}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Employee Records
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and track company employees
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            {selectedEmployees.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md"
              >
                {isDeleting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                Delete Selected ({selectedEmployees.size})
              </button>
            )}
            <button
              onClick={handleExportExcel}
              disabled={filteredData.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md"
            >
              <FileSpreadsheet size={18} />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={filteredData.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md"
            >
              <File size={18} />
              PDF
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm text-sm"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setSelectedEmployees(new Set()); // Clear selection on search
              }}
            />
          </div>
          <select
            value={filterField}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm text-sm min-w-[140px]"
            onChange={(e) => {
              setFilterField(e.target.value);
              setCurrentPage(1);
              setSelectedEmployees(new Set()); // Clear selection on filter change
            }}
          >
            <option value="all">All Fields</option>
            {headers.map((h) => (
              <option key={h.key} value={h.key}>
                {h.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-gray-500 text-sm font-medium">
                Loading employees...
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-700 text-white border-b border-gray-200">
                      <th className="p-4 w-12">
                        <button
                          onClick={handleSelectAll}
                          className="text-white hover:text-gray-200 transition-colors"
                          title="Select/Deselect all on current page"
                        >
                          {paginatedData.length > 0 &&
                          paginatedData.every((_, idx) => 
                            selectedEmployees.has(getOriginalIndex(idx))
                          ) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </th>
                      <th className="p-4 text-xl font-semibold w-16">
                        Sr.N.
                      </th>
                      {headers.map((h) => (
                        <th
                          key={h.key}
                          onClick={() => handleSort(h.key)}
                          className="p-4 text-2xl font-semibold cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 text-xl font-semibold">
                            {h.label}
                            <span className="transition-colors">
                              {sortConfig.key === h.key &&
                                (sortConfig.direction === "asc" ? (
                                  <ChevronUp size={14} />
                                ) : (
                                  <ChevronDown size={14} />
                                ))}
                              {sortConfig.key !== h.key && (
                                <ChevronUp
                                  size={14}
                                  className="opacity-0 group-hover:opacity-50"
                                />
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="p-4 text-xl font-semibold text-center w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-lg font-medium divide-gray-200">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => {
                        const originalIndex = getOriginalIndex(idx);
                        const employeeId = row[0]; // Assuming EPF is the ID
                        const isSelected = selectedEmployees.has(originalIndex);
                        
                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-blue-50/40 transition-colors duration-150 group ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                          >
                            <td className="p-4">
                              <button
                                onClick={() => handleSelectEmployee(idx)}
                                className="text-gray-500 hover:text-blue-600 transition-colors"
                                title="Select/Deselect employee"
                              >
                                {isSelected ? (
                                  <CheckSquare size={20} className="text-blue-600" />
                                ) : (
                                  <Square size={20} />
                                )}
                              </button>
                            </td>
                            <td className="p-4 font-medium">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </td>
                            {row.map((val, i) => (
                              <td key={i} className="p-4 whitespace-nowrap">
                                {val || <span className="text-gray-400">-</span>}
                              </td>
                            ))}
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(employeeId)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                  title="Edit employee"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleSingleDelete(employeeId, originalIndex)}
                                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="Delete employee"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={headers.length + 3}
                          className="p-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-gray-400 text-sm font-medium">
                              No employees found
                            </p>
                            <p className="text-gray-300 text-xs">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50">
                  <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
                    {sortedData.length} entries
                    {selectedEmployees.size > 0 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        ({selectedEmployees.size} selected)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 order-1 sm:order-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;