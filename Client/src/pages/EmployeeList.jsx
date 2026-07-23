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
  MapPin,
  DollarSign,
  Award,
  Heart,
  Users,
  Eye,
  CreditCard,
  Building,
  AlertTriangle,
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    id: null,
    index: null,
    count: 0,
  });

  const navigate = useNavigate();

  // Items per page options
  const itemsPerPageOptions = [10, 25, 50, 100, "All"];

  // Function to format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    // If already in DD/MM/YYYY format, return as is
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateStr;
    }
    // Convert from YYYY-MM-DD to DD/MM/YYYY
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = dateStr.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Updated headers with all new fields (16 columns total)
  const headers = [
    { key: "id", label: "ID", icon: Key },
    { key: "formNo", label: "Form No.", icon: FileText },
    { key: "name", label: "Name", icon: User },
    { key: "fatherName", label: "Father's Name", icon: UserCircle },
    { key: "designation", label: "Designation", icon: Briefcase },
    { key: "depotName", label: "Depot", icon: MapPin },
    { key: "exitDate", label: "Exit Date", icon: Calendar },
    { key: "lastBasicPay", label: "Basic Pay", icon: DollarSign },
    { key: "exgratiaAmount", label: "Exgratia", icon: Award },
    { key: "gratuityAmount", label: "Gratuity", icon: Award },
    {
      key: "leaveEncashmentAmount",
      label: "Leave Encashment",
      icon: DollarSign,
    },
    { key: "nominee", label: "Nominee", icon: Users },
    { key: "relation", label: "Relation", icon: Heart },
    { key: "bankAccountNumber", label: "Bank Account", icon: CreditCard },
    { key: "ifscCode", label: "IFSC Code", icon: Building },
    { key: "vrs", label: "VRS/Retirement", icon: AlertTriangle },
  ];

  // ALL fields for mobile view
  const mobileFields = [
    { key: "formNo", label: "Form No.", icon: FileText },
    { key: "name", label: "Name", icon: User },
    { key: "fatherName", label: "Father's Name", icon: UserCircle },
    { key: "designation", label: "Designation", icon: Briefcase },
    { key: "depotName", label: "Depot", icon: MapPin },
    { key: "exitDate", label: "Exit Date", icon: Calendar },
    { key: "lastBasicPay", label: "Basic Pay", icon: DollarSign },
    { key: "exgratiaAmount", label: "Exgratia", icon: Award },
    { key: "gratuityAmount", label: "Gratuity", icon: Award },
    {
      key: "leaveEncashmentAmount",
      label: "Leave Encashment",
      icon: DollarSign,
    },
    { key: "nominee", label: "Nominee", icon: Users },
    { key: "relation", label: "Relation", icon: Heart },
    { key: "bankAccountNumber", label: "Bank Account", icon: CreditCard },
    { key: "ifscCode", label: "IFSC Code", icon: Building },
    { key: "vrs", label: "VRS/Retirement", icon: AlertTriangle },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeService.getAll();

      console.log("Fetched employees:", res);

      let employeeData = [];

      if (res?.data?.data && Array.isArray(res.data.data)) {
        employeeData = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        employeeData = res.data;
      } else if (Array.isArray(res)) {
        employeeData = res;
      }

      // Normalize data - ensure all rows have 16 fields
      employeeData = employeeData.map((row) => {
        const normalizedRow = [...row];
        while (normalizedRow.length < 16) {
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

  // Function to highlight search term in text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim() || !text) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = String(text).split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-300 px-0.5 rounded font-medium">
          {part}
        </span>
      ) : (
        part
      ),
    );
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

  // ALWAYS show all filtered data, selection should not hide rows
  const displayData = filteredData;

  const totalPages = useMemo(() => {
    if (itemsPerPage === "All") return 1;
    return Math.max(1, Math.ceil(displayData.length / itemsPerPage));
  }, [displayData, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    if (itemsPerPage === "All") return displayData;
    return displayData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [displayData, currentPage, itemsPerPage]);

  const getOriginalIndex = (pageIndex) => {
    if (itemsPerPage === "All") return pageIndex;
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

  // Confirmation Dialog
  const showConfirmDialog = (type, id = null, index = null) => {
    setConfirmDialog({
      isOpen: true,
      type,
      id,
      index,
      count: type === "bulk" ? selectedEmployees.size : 1,
    });
  };

  const handleConfirmDelete = async () => {
    const { type, id, index, count } = confirmDialog;

    setIsDeleting(true);
    try {
      if (type === "single" && id) {
        await employeeService.delete(id);
        toast.success("Employee deleted successfully!");

        const newSelected = new Set(selectedEmployees);
        newSelected.delete(index);
        setSelectedEmployees(newSelected);
      } else if (type === "bulk") {
        const selectedIds = Array.from(selectedEmployees)
          .map((idx) => employees[idx]?.[0])
          .filter((id) => id);

        for (const empId of selectedIds) {
          if (empId) {
            await employeeService.delete(empId);
          }
        }
        toast.success(`${count} employee(s) deleted successfully!`);
        setSelectedEmployees(new Set());
      }

      await fetchEmployees();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete employee(s)");
    } finally {
      setIsDeleting(false);
      setConfirmDialog({
        isOpen: false,
        type: "",
        id: null,
        index: null,
        count: 0,
      });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      type: "",
      id: null,
      index: null,
      count: 0,
    });
  };

  const handleSingleDelete = (employeeId, index) => {
    showConfirmDialog("single", employeeId, index);
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) {
      toast.warning("Please select at least one employee to delete");
      return;
    }
    showConfirmDialog("bulk");
  };

  const handleEdit = (employeeId) => {
    setEditingEmployee(employeeId);
    navigate(`/employee-form/${employeeId}`);
  };

  // Export functions - respect selection
  const getExportData = () => {
    if (selectedEmployees.size > 0) {
      // Only export selected employees
      return employees.filter((_, index) => selectedEmployees.has(index));
    }
    // Export all filtered data
    return filteredData;
  };

  const handleExportExcel = () => {
    const exportData = getExportData();
    if (exportData.length === 0) {
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

      const displayHeaders = headers.slice(1);

      const excelData = exportData.map((row, index) => {
        const obj = { "S.No": index + 1 };
        displayHeaders.forEach((h, i) => {
          // Format date for exitDate field (index 6)
          let value = row[i + 1] || "---";
          if (h.key === "exitDate" && value !== "---") {
            value = formatDate(value);
          }
          obj[h.label] = value;
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

  const handleExportPDF = () => {
    const exportData = getExportData();
    if (!exportData || exportData.length === 0) {
      toast.warning("No data to export!");
      return;
    }

    try {
      const displayListName =
        selectedEmployees.size > 0
          ? "Selected Employees Report"
          : "Employee List Report";

      const hasLongContent = exportData.some(
        (row) =>
          (row[2] && row[2].length > 25) || // Name
          (row[3] && row[3].length > 25) || // Father's Name
          (row[5] && row[5].length > 20) || // Depot
          (row[13] && row[13].length > 15) || // Bank Account
          (row[14] && row[14].length > 11), // IFSC Code
      );

      const dynamicOrientation = hasLongContent ? "landscape" : "portrait";
      const doc = new jsPDF({ orientation: dynamicOrientation });

      const generatedDate = new Date().toLocaleDateString();
      const generatedTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const totalRecords = exportData.length;

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

      const displayHeaders = headers.slice(1);
      const tableColumn = ["S.No", ...displayHeaders.map((h) => h.label)];

      const tableRows = exportData.map((row, index) => [
        index + 1,
        ...row.slice(1).map((val, i) => {
          // Format date for exitDate field (index 6)
          if (i === 5 && val) {
            // exitDate is at index 6 in original, but in slice it's index 5
            return formatDate(val) || "---";
          }
          return val || "---";
        }),
      ]);

      let dynamicFontSize = dynamicOrientation === "portrait" ? 6 : 7;
      let maxNameLength = 0;
      let maxFatherLength = 0;
      let maxBankLength = 0;

      exportData.forEach((row) => {
        if (row[2] && row[2].length > maxNameLength)
          maxNameLength = row[2].length;
        if (row[3] && row[3].length > maxFatherLength)
          maxFatherLength = row[3].length;
        if (row[13] && row[13].length > maxBankLength)
          maxBankLength = row[13].length;
      });

      if (maxNameLength > 30 || maxFatherLength > 30 || maxBankLength > 18) {
        dynamicFontSize = 5;
      } else if (
        maxNameLength > 20 ||
        maxFatherLength > 20 ||
        maxBankLength > 14
      ) {
        dynamicFontSize = 5.5;
      } else if (maxNameLength > 15 || maxFatherLength > 15) {
        dynamicFontSize = 6;
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
          1: { halign: "center", cellWidth: dynamicFontSize < 6 ? 12 : 15 },
          2: { cellWidth: "auto" },
          3: { cellWidth: "auto" },
          4: { cellWidth: "auto" },
          5: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
          6: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
          7: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
          8: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
          9: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
          10: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
          11: { cellWidth: "auto" },
          12: { cellWidth: "auto" },
          13: { halign: "center", cellWidth: dynamicFontSize < 6 ? 16 : 20 },
          14: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
          15: { halign: "center", cellWidth: dynamicFontSize < 6 ? 14 : 18 },
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

  // Render Mobile Card View with ALL fields
  const renderMobileCard = (row, idx) => {
    const originalIndex = getOriginalIndex(idx);
    const employeeId = row[0];
    const isSelected = selectedEmployees.has(originalIndex);

    // Map fields to data indices (index 0 is ID, so fields start from index 1)
    const fieldDataMap = {
      formNo: 1,
      name: 2,
      fatherName: 3,
      designation: 4,
      depotName: 5,
      exitDate: 6,
      lastBasicPay: 7,
      exgratiaAmount: 8,
      gratuityAmount: 9,
      leaveEncashmentAmount: 10,
      nominee: 11,
      relation: 12,
      bankAccountNumber: 13,
      ifscCode: 14,
      vrs: 15,
    };

    return (
      <div
        key={idx}
        className={`bg-white rounded-xl shadow-sm border p-4 mb-3 transition-all ${
          isSelected
            ? "border-blue-500 bg-blue-50/50"
            : "border-gray-200 hover:border-blue-300"
        }`}
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectEmployee(idx)}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              {isSelected ? (
                <CheckSquare size={22} className="text-blue-600" />
              ) : (
                <Square size={22} />
              )}
            </button>
            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              Sr.No.{originalIndex + 1}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(employeeId)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleSingleDelete(employeeId, originalIndex)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {mobileFields.map((field) => {
            const dataIndex = fieldDataMap[field.key];
            let value = row[dataIndex];
            // Format date for exitDate field
            if (field.key === "exitDate" && value) {
              value = formatDate(value);
            }
            return (
              <div
                key={field.key}
                className="flex items-center justify-between gap-2 text-base"
              >
                <div className="flex items-center gap-2 text-gray-600 flex-shrink-0">
                  <field.icon size={16} />
                  <span className="font-medium">{field.label}:</span>
                </div>
                <div className="text-gray-800 break-words text-right flex-1 text-base">
                  {value ? (
                    highlightText(value, searchTerm)
                  ) : (
                    <span className="text-gray-400">---</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Desktop Table View with highlight
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white border-b border-gray-200 sticky top-0 z-10">
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
            <th className="p-4 text-base font-semibold w-16">Sr.No.</th>
            {headers.slice(1).map((h) => (
              <th
                key={h.key}
                onClick={() => handleSort(h.key)}
                className="p-4 text-base font-semibold cursor-pointer hover:bg-blue-600 transition-colors whitespace-nowrap select-none"
              >
                <div className="flex items-center gap-2">
                  {h.label}
                  <span className="transition-colors">
                    {sortConfig.key === h.key &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                    {sortConfig.key !== h.key && (
                      <ChevronUp
                        size={16}
                        className="opacity-0 group-hover:opacity-50"
                      />
                    )}
                  </span>
                </div>
              </th>
            ))}
            <th className="p-4 text-base font-semibold text-center w-28">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {paginatedData.length > 0 ? (
            paginatedData.map((row, idx) => {
              const originalIndex = getOriginalIndex(idx);
              const employeeId = row[0];
              const isSelected = selectedEmployees.has(originalIndex);

              return (
                <tr
                  key={idx}
                  className={`hover:bg-blue-50/60 transition-colors duration-150 ${
                    isSelected ? "bg-blue-50/80" : ""
                  } ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
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
                  <td className="p-4 text-base font-medium text-gray-500">
                    {(currentPage - 1) *
                      (itemsPerPage === "All"
                        ? displayData.length
                        : itemsPerPage) +
                      idx +
                      1}
                  </td>
                  {row.slice(1, 16).map((val, i) => {
                    // Format date for exitDate field (index 5 in slice)
                    let displayValue = val;
                    if (i === 5 && val) {
                      // exitDate is at index 6 in original, index 5 in slice
                      displayValue = formatDate(val);
                    }
                    return (
                      <td
                        key={i}
                        className="p-4 text-base text-gray-700 max-w-xs truncate"
                      >
                        {displayValue ? (
                          highlightText(displayValue, searchTerm)
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(employeeId)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleSingleDelete(employeeId, originalIndex)
                        }
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
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
                colSpan={headers.length + 2}
                className="p-10 text-center text-gray-500"
              >
                <div className="flex flex-col items-center gap-3">
                  <Search size={40} className="text-gray-300" />
                  <p className="text-base font-medium">No records found</p>
                  <p className="text-sm text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4">
      <div className="w-full mx-auto ">
        {/* Header Section */}
        <div className=" bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Employee Records
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Manage and track all employee information
              </p>
              {selectedEmployees.size > 0 && (
                <p className="text-sm text-blue-600 font-medium mt-2 bg-blue-50 px-3 py-1.5 rounded inline-block">
                  {selectedEmployees.size} employee(s) selected
                </p>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              {selectedEmployees.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium shadow-sm"
                >
                  {isDeleting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                  <span>Delete ({selectedEmployees.size})</span>
                </button>
              )}
              <button
                onClick={handleExportExcel}
                disabled={filteredData.length === 0}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium shadow-sm"
              >
                <FileSpreadsheet size={18} />
                <span>Excel</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={filteredData.length === 0}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium shadow-sm"
              >
                <File size={18} />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm sm:text-base">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                className="w-full pl-11 sm:pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-base"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                  setSelectedEmployees(new Set());
                }}
              />
            </div>
            <select
              value={filterField}
              className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-base min-w-[140px] sm:min-w-[160px]"
              onChange={(e) => {
                setFilterField(e.target.value);
                setCurrentPage(1);
                setSelectedEmployees(new Set());
              }}
            >
              <option value="all">All Fields</option>
              {headers.slice(1).map((h) => (
                <option key={h.key} value={h.key}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="rounded-xl shadow-lg border border-gray-200 overflow-hidden bg-white">
          {/* Top Bar with Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-5 bg-gray-50/80 border-b border-gray-200">
            <div className="text-sm sm:text-base text-gray-600 order-2 sm:order-1">
              Showing{" "}
              {displayData.length > 0
                ? (currentPage - 1) *
                    (itemsPerPage === "All"
                      ? displayData.length
                      : itemsPerPage) +
                  1
                : 0}{" "}
              -{" "}
              {Math.min(
                currentPage *
                  (itemsPerPage === "All" ? displayData.length : itemsPerPage),
                displayData.length,
              )}{" "}
              of {displayData.length} entries
              {selectedEmployees.size > 0 && (
                <span className="ml-3 text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded">
                  {selectedEmployees.size} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 order-1 sm:order-2 flex-wrap justify-center">
              {/* Items per page dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowItemsDropdown(!showItemsDropdown)}
                  className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                >
                  <Eye size={16} className="text-gray-500" />
                  <span className="font-medium">{itemsPerPage}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${showItemsDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showItemsDropdown && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    {itemsPerPageOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setItemsPerPage(option);
                          setShowItemsDropdown(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                          itemsPerPage === option
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination buttons */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft size={16} />
                    <span>Prev</span>
                  </button>
                  <span className="text-sm sm:text-base font-medium text-gray-700 px-3">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <p className="text-gray-500 text-base font-medium">
                Loading employees...
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table - Hidden on Mobile */}
              <div className="hidden md:block">{renderTable()}</div>

              {/* Mobile Cards - Visible only on Mobile with ALL fields */}
              <div className="md:hidden p-3">
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, idx) => renderMobileCard(row, idx))
                ) : (
                  <div className="text-center py-12">
                    <Search size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-base font-medium">
                      No employees found
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              Are you sure?
            </h3>
            <p className="text-center text-gray-600 mb-6 text-base">
              {confirmDialog.type === "bulk" ? (
                <>
                  You are about to delete{" "}
                  <span className="font-bold text-red-600">
                    {confirmDialog.count}
                  </span>{" "}
                  employee(s). This action cannot be undone.
                </>
              ) : (
                <>
                  You are about to delete this employee. This action cannot be
                  undone.
                </>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-base"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-base flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
