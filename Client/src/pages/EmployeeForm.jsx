import React, { useState, useEffect } from "react";
import {
  User,
  Key,
  FileText,
  UserCircle,
  Briefcase,
  Calendar,
  LogOut,
  Send,
  Loader2,
  Building2,
  UserCheck,
  ArrowLeft,
  Edit3,
} from "lucide-react";
import employeeService from "../services/employeeService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const EmployeeForm = () => {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const isEditMode = !!id; // Check if we're in edit mode

  const [formData, setFormData] = useState({
    epfNo: "",
    uan: "",
    ppoNo: "",
    name: "",
    fatherName: "",
    designation: "",
    livingDate: "",
    exitDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode); // Loading if edit mode
  const [error, setError] = useState(null);

  // Fetch employee data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchEmployeeData();
    }
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all employees and find the one with matching ID
      const response = await employeeService.getAll();

      let employees = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        employees = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        employees = response.data;
      } else if (Array.isArray(response)) {
        employees = response;
      }

      // Find employee by ID (first column is UUID)
      const employee = employees.find((emp) => emp[0] === id);

      if (employee) {
        setFormData({
          epfNo: employee[1] || "",
          uan: employee[2] || "",
          ppoNo: employee[3] || "",
          name: employee[4] || "",
          fatherName: employee[5] || "",
          designation: employee[6] || "",
          livingDate: employee[7] || "",
          exitDate: employee[8] || "",
        });
        toast.info("Employee data loaded for editing");
      } else {
        setError("Employee not found");
        toast.error("Employee not found with ID: ");
      }
    } catch (err) {
      console.error("Error fetching employee:", err);
      setError("Failed to load employee data");
      toast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        // Update existing employee
        await employeeService.update(id, formData);
        toast.success("Employee updated successfully!");
      } else {
        // Create new employee
        await employeeService.create(formData);
        toast.success("Employee added successfully!");
      }

      // Reset form
      setFormData({
        epfNo: "",
        uan: "",
        ppoNo: "",
        name: "",
        fatherName: "",
        designation: "",
        livingDate: "",
        exitDate: "",
      });

      // Navigate back to employee list
      navigate("/employee-list");
    } catch (error) {
      console.error("Submit error:", error);
      const errorMsg = error.response?.data?.error || "Failed to submit data";
      setError(errorMsg);
      toast.error(
        isEditMode ? "Failed to update employee" : "Failed to add employee",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field configurations
  const fieldConfigs = [
    { label: "EPF Account No.", name: "epfNo", icon: Key },
    { label: "UAN", name: "uan", icon: FileText },
    { label: "PPO No.", name: "ppoNo", icon: UserCheck },
    { label: "Employee Name", name: "name", icon: User },
    { label: "Father's Name", name: "fatherName", icon: UserCircle },
    { label: "Designation", name: "designation", icon: Briefcase },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-6 flex items-center justify-center  py-4">
      <div className="w-full  bg-white shadow-xl rounded-xl sm:rounded-2xl p-4 md:p-8 lg:p-10 border border-slate-100 transition-all duration-300">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-white shadow-lg shadow-blue-600/20">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Employee" : "Employee Work Sheet"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {isEditMode
                  ? `Editing employee with ID: ${id?.substring(0, 8)}...`
                  : "M.P. Road Transport Corp."}
              </p>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate("/employee-list")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Edit Mode Indicator */}
        {isEditMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700 text-sm">
            <Edit3 size={16} />
            <span>
              You are editing employee:{" "}
              <strong>{formData.name || "..."}</strong>
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {/* Standard Text Inputs */}
            {fieldConfigs.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-medium text-gray-600">
                  {field.label}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative group">
                  <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name={field.name}
                    required
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:bg-white"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              </div>
            ))}

            {/* Living Date */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-medium text-gray-600">
                Living Date
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="date"
                  name="livingDate"
                  required
                  value={formData.livingDate}
                  onChange={handleChange}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:bg-white"
                />
              </div>
            </div>

            {/* Exit Date */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-medium text-gray-600">
                Exit Date
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative group">
                <LogOut className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="date"
                  name="exitDate"
                  required
                  value={formData.exitDate}
                  onChange={handleChange}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 sm:py-3 md:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>{isEditMode ? "Updating..." : "Submitting..."}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{isEditMode ? "Update Employee" : "Submit Details"}</span>
              </>
            )}
          </button>

          {/* Footer Info */}
          <p className="text-center text-xs text-gray-400 mt-2">
            {isEditMode
              ? "Update the employee information. All fields are required."
              : "All fields are required. Please verify before submitting."}
          </p>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
