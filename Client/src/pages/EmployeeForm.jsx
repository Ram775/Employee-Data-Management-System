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
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

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
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchEmployeeData();
    }
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll();
      let employees = Array.isArray(response)
        ? response
        : response?.data?.data || response?.data || [];
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
      } else {
        setError("Employee not found");
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (name, value) => {
    // Numeric fields: Only allow digits
    if (["epfNo", "uan", "ppoNo"].includes(name)) {
      return /^[0-9]*$/.test(value);
    }
    // Text fields: Allow letters, spaces, and dots
    if (["name", "fatherName", "designation"].includes(name)) {
      return /^[a-zA-Z\s.]*$/.test(value);
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (validateInput(name, value)) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) await employeeService.update(id, formData);
      else await employeeService.create(formData);

      toast.success(
        isEditMode ? "Updated successfully!" : "Added successfully!",
      );
      navigate("/employee-list");
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldConfigs = [
    {
      label: "EPF Account No.",
      name: "epfNo",
      icon: Key,
      placeholder: "e.g., 100012345678",
    },
    {
      label: "UAN",
      name: "uan",
      icon: FileText,
      placeholder: "e.g., 100123456789",
    },
    {
      label: "PPO No.",
      name: "ppoNo",
      icon: UserCheck,
      placeholder: "e.g., MP12345678",
    },
    {
      label: "Employee Name",
      name: "name",
      icon: User,
      placeholder: "e.g., Rajesh Kumar",
    },
    {
      label: "Father's Name",
      name: "fatherName",
      icon: UserCircle,
      placeholder: "e.g., Suresh Singh",
    },
    {
      label: "Designation",
      name: "designation",
      icon: Briefcase,
      placeholder: "e.g., Senior Clerk",
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="md:px-6 flex items-center justify-center py-4">
      <div className="w-full bg-white shadow-xl rounded-xl p-4 md:p-10 border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Employee" : "Employee Work Sheet"}
          </h2>
          <button
            onClick={() => navigate("/employee-list")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {fieldConfigs.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-600">
                  {field.label} *
                </label>
                <div className="relative">
                  <field.icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    name={field.name}
                    required
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-600">
                Living Date *
              </label>
              <input
                type="date"
                name="livingDate"
                required
                value={formData.livingDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-600">
                Exit Date *
              </label>
              <input
                type="date"
                name="exitDate"
                required
                value={formData.exitDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
            {isEditMode ? "Update Details" : "Submit Details"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
