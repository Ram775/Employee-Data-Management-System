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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import employeeService from "../services/employeeService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  // Headers with ID included (but ID will be displayed separately)
  const headers = [
    { key: "id", label: "ID", icon: Key },
    { key: "epf", label: "EPF", icon: Key },
    { key: "uan", label: "UAN", icon: FileText },
    { key: "ppo", label: "PPO", icon: UserCheck },
    { key: "name", label: "Name", icon: User },
    { key: "father", label: "Father", icon: UserCircle },
    { key: "designation", label: "Designation", icon: Briefcase },
    { key: "livingDate", label: "Living Date", icon: Calendar },
    { key: "exitDate", label: "Exit Date", icon: LogOut },
  ];

  // Mobile card fields (excluding ID)
  const cardFields = [
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

  // Updated fetchEmployees to handle UUID
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeService.getAll();

      console.log("Fetched employees:", res);

      let employeeData = [];

      // Handle different response structures
      if (res?.data?.data && Array.isArray(res.data.data)) {
        employeeData = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        employeeData = res.data;
      } else if (Array.isArray(res)) {
        employeeData = res;
      }

      // Normalize data - ensure all rows have 9 fields (ID + 8 fields)
      employeeData = employeeData.map((row) => {
        const normalizedRow = [...row];
        while (normalizedRow.length < 9) {
          normalizedRow.push("");
        }
        return normalizedRow;
      });

      setEmployees(employeeData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data.");
      toast.error("Failed to load employee data.");
    } finally {
      setLoading(false);
    }
  };

  // Updated filteredData - handle ID column
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
      // Find the index of the field (including ID)
      const fieldIndex = headers.findIndex((h) => h.key === filterField);
      return String(emp[fieldIndex] || "")
        .toLowerCase()
        .includes(searchLower);
    });
  }, [employees, searchTerm, filterField]);

  // Updated sortedData
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

  const getOriginalIndex = (pageIndex) => {
    return (currentPage - 1) * itemsPerPage + pageIndex;
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

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

  const handleSelectAll = () => {
    const newSelected = new Set(selectedEmployees);
    const currentPageIndices = paginatedData.map((_, idx) =>
      getOriginalIndex(idx),
    );

    const allSelected = currentPageIndices.every((idx) => newSelected.has(idx));

    if (allSelected) {
      currentPageIndices.forEach((idx) => newSelected.delete(idx));
    } else {
      currentPageIndices.forEach((idx) => newSelected.add(idx));
    }
    setSelectedEmployees(newSelected);
  };

  // Updated handleBulkDelete - using UUID (index 0)
  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) {
      toast.warning("Please select at least one employee to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedEmployees.size} employee(s)?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // Get UUIDs from first column (index 0)
      const selectedIds = Array.from(selectedEmployees)
        .map((index) => employees[index]?.[0])
        .filter((id) => id); // Remove undefined/null

      console.log("Deleting IDs:", selectedIds);

      // Delete each employee by UUID
      for (const id of selectedIds) {
        if (id) {
          await employeeService.delete(id);
        }
      }

      toast.success(
        `${selectedEmployees.size} employee(s) deleted successfully!`,
      );
      setSelectedEmployees(new Set());
      await fetchEmployees();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete selected employees");
    } finally {
      setIsDeleting(false);
    }
  };

  // Updated handleSingleDelete - using UUID
  const handleSingleDelete = async (employeeId, index) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      console.log("Deleting employee with ID:", employeeId);
      await employeeService.delete(employeeId);
      toast.success("Employee deleted successfully!");

      const newSelected = new Set(selectedEmployees);
      newSelected.delete(index);
      setSelectedEmployees(newSelected);

      await fetchEmployees();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete employee");
    }
  };

  // Updated handleEdit - using UUID
  const handleEdit = (employeeId) => {
    setEditingEmployee(employeeId);

    navigate(`/employee-form/${employeeId}`);
  };

  // Updated handleExportExcel - include ID column
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

      // Use displayHeaders (without ID)
      const displayHeaders = headers.slice(1); // Skip ID column

      const excelData = filteredData.map((row, index) => {
        const obj = { "S.No": index + 1 };
        // Map headers excluding ID (start from index 1)
        displayHeaders.forEach((h, i) => {
          obj[h.label] = row[i + 1] || "N/A"; // i+1 because first column is ID
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

  // Updated handleExportPDF - include ID column
  const handleExportPDF = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.warning("No data to export!");
      return;
    }

    try {
      const displayListName = "Employee List Report";

      // Check for long content (using actual data indices, not including ID)
      const hasLongContent = filteredData.some(
        (row) =>
          (row[5] && row[5].length > 25) || // Name is at index 5
          (row[2] && row[2].length > 15), // UAN is at index 2
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

      // Use displayHeaders (without ID)
      const displayHeaders = headers.slice(1);
      const tableColumn = ["S.No", ...displayHeaders.map((h) => h.label)];

      // Prepare table rows - exclude ID column (index 0)
      const tableRows = filteredData.map((row, index) => [
        index + 1,
        ...row.slice(1).map((val) => val || "N/A"), // Skip ID at index 0
      ]);

      let dynamicFontSize = dynamicOrientation === "portrait" ? 6.5 : 7.5;
      let maxNameLength = 0;
      let maxUANLength = 0;

      filteredData.forEach((row) => {
        if (row[5] && row[5].length > maxNameLength)
          maxNameLength = row[5].length; // Name is at index 5
        if (row[2] && row[2].length > maxUANLength)
          maxUANLength = row[2].length; // UAN is at index 2
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
          1: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 }, // EPF
          2: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 }, // UAN
          3: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 }, // PPO
          4: { cellWidth: "auto" }, // Name
          5: { cellWidth: "auto" }, // Father
          6: { cellWidth: "auto" }, // Designation
          7: { halign: "center", cellWidth: dynamicFontSize < 6 ? 18 : 22 }, // Living Date
          8: { halign: "center", cellWidth: dynamicFontSize < 6 ? 16 : 20 }, // Exit Date
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

  // Render Mobile Card View - Updated for UUID
  const renderMobileCard = (row, idx) => {
    const originalIndex = getOriginalIndex(idx);
    const employeeId = row[0]; // UUID at index 0
    const isSelected = selectedEmployees.has(originalIndex);

    return (
      <div
        key={idx}
        className={`bg-white rounded-xl shadow-md border p-4 mb-3 transition-all ${
          isSelected ? "border-blue-500 bg-blue-50/30" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectEmployee(idx)}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              {isSelected ? (
                <CheckSquare size={20} className="text-blue-600" />
              ) : (
                <Square size={20} />
              )}
            </button>
            <span className="text-xs font-medium text-gray-400">
              #{originalIndex + 1}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              ID: {employeeId ? employeeId.substring(0, 8) : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(employeeId)}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleSingleDelete(employeeId, originalIndex)}
              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Card Fields - Skip ID (index 0), show from index 1 */}
        <div className="space-y-2">
          {cardFields.map((field, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
                <field.icon size={14} />
                <span className="font-medium">{field.label}:</span>
              </div>
              <div className="text-gray-700 break-words text-right flex-1">
                {row[i + 1] || <span className="text-gray-400">---</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Desktop Table View - Updated for UUID
  const renderTable = () => (
    <div className="overflow-x-auto hidden md:block">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-blue-700 text-white border-b border-gray-200">
            <th className="p-4 w-12">
              <button
                onClick={handleSelectAll}
                className="text-white hover:text-gray-200 transition-colors"
              >
                {paginatedData.length > 0 &&
                paginatedData.every((_, idx) =>
                  selectedEmployees.has(getOriginalIndex(idx)),
                ) ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>
            </th>
            <th className="p-4 text-sm font-semibold w-16">Sr.N.</th>
            {headers.slice(1).map((h) => (
              <th
                key={h.key}
                onClick={() => handleSort(h.key)}
                className="p-4 text-sm font-semibold cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
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
            <th className="p-4 text-sm font-semibold text-center w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedData.map((row, idx) => {
            const originalIndex = getOriginalIndex(idx);
            const employeeId = row[0]; // UUID at index 0
            const isSelected = selectedEmployees.has(originalIndex);

            return (
              <tr
                key={idx}
                className={`hover:bg-blue-50/40 transition-colors duration-150 ${
                  isSelected ? "bg-blue-50" : ""
                }`}
              >
                <td className="p-4">
                  <button
                    onClick={() => handleSelectEmployee(idx)}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare size={20} className="text-blue-600" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </td>
                <td className="p-4 text-sm font-medium">
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </td>

                {/* Display data from index 1 to 8 (skip ID) */}
                {row.slice(1, 9).map((val, i) => (
                  <td key={i} className="p-4 text-sm whitespace-nowrap">
                    {val || <span className="text-gray-400">-</span>}
                  </td>
                ))}
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(employeeId)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() =>
                        handleSingleDelete(employeeId, originalIndex)
                      }
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen sm:p-1 md:p-4">
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Employee Records
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Manage and track company employees
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            {selectedEmployees.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                <span className="hidden xs:inline">Delete</span>
                <span className="xs:hidden">{selectedEmployees.size}</span>
              </button>
            )}
            <button
              onClick={handleExportExcel}
              disabled={filteredData.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden xs:inline">Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={filteredData.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-rose-600 text-white rounded-lg sm:rounded-xl hover:bg-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
            >
              <File size={16} />
              <span className="hidden xs:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 md:mb-6 flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm text-xs sm:text-sm"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setSelectedEmployees(new Set());
              }}
            />
          </div>
          <select
            value={filterField}
            className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm text-xs sm:text-sm min-w-[120px] sm:min-w-[140px]"
            onChange={(e) => {
              setFilterField(e.target.value);
              setCurrentPage(1);
              setSelectedEmployees(new Set());
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

        {/* Main Content Container */}
        <div className="rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
          {loading ? (
            <div className="p-1 sm:p-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Loading employees...
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table - Hidden on Mobile */}
              {renderTable()}

              {/* Mobile Cards - Visible only on Mobile */}
              <div className="md:hidden p-1 sm:p-2">
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, idx) => renderMobileCard(row, idx))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm font-medium">
                      No employees found
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-3 sm:p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50">
                  <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1 text-center sm:text-left">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
                    {sortedData.length} entries
                    {selectedEmployees.size > 0 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        ({selectedEmployees.size} selected)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden xs:inline">Prev</span>
                    </button>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <ChevronRight size={14} />
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
