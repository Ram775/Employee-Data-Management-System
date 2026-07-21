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
  AlertCircle,
  MapPin,
  Users,
  Award,
  DollarSign,
  Heart,
} from "lucide-react";
import employeeService from "../services/employeeService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    formNo: "",
    name: "",
    fatherName: "",
    designation: "",
    depotName: "",
    exitDate: "",
    lastBasicPay: "",
    exgratiaAmount: "",
    gratuityAmount: "",
    leaveEncashmentAmount: "",
    nominee: "",
    relation: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  // Depot options
  const depotOptions = [
    "Guna",
    "Biaora",
    "Sehore",
    "Vidisha",
    "Bhopal City",
    "Bhopal R",
    "Hoshangabad",
    "Pipariya",
    "Betul",
    "Head office",
    "Sagar",
  ];

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
          formNo: employee[1] || "",
          name: employee[2] || "",
          fatherName: employee[3] || "",
          designation: employee[4] || "",
          depotName: employee[5] || "",
          exitDate: employee[6] || "",
          lastBasicPay: employee[7] || "",
          exgratiaAmount: employee[8] || "",
          gratuityAmount: employee[9] || "",
          leaveEncashmentAmount: employee[10] || "",
          nominee: employee[11] || "",
          relation: employee[12] || "",
        });
      } else {
        setError("Employee not found");
      }
    } catch (err) {
      setError("Failed to load data");
      toast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    let error = "";

    // Required fields validation
    const requiredFields = [
      "formNo",
      "name",
      "fatherName",
      "designation",
      "depotName",
      "exitDate",
    ];
    if (requiredFields.includes(name) && !value.trim()) {
      return `${
        name === "formNo"
          ? "Form Number"
          : name === "name"
            ? "Employee Name"
            : name === "fatherName"
              ? "Father's Name"
              : name === "designation"
                ? "Designation"
                : name === "depotName"
                  ? "Depot Name"
                  : "Exit Date"
      } is required`;
    }

    // Form Number validation - alphanumeric with hyphen
    if (name === "formNo" && value && !/^[A-Za-z0-9\-]*$/.test(value)) {
      error = "Form Number can only contain letters, numbers, and hyphens";
    }

    // Name validations - only letters, spaces, and dots
    if (
      (name === "name" || name === "fatherName" || name === "nominee") &&
      value &&
      !/^[a-zA-Z\s.]*$/.test(value)
    ) {
      error = `${name === "name" ? "Employee" : name === "fatherName" ? "Father's" : "Nominee"} name can only contain letters, spaces, and dots`;
    }

    // Designation validation - letters, spaces, and parentheses
    if (name === "designation" && value && !/^[a-zA-Z\s()\-]*$/.test(value)) {
      error =
        "Designation can only contain letters, spaces, hyphens, and parentheses";
    }

    // Numeric fields validation - only digits and decimal points
    const numericFields = [
      "lastBasicPay",
      "exgratiaAmount",
      "gratuityAmount",
      "leaveEncashmentAmount",
    ];
    if (numericFields.includes(name) && value && !/^\d*\.?\d*$/.test(value)) {
      error = `${name.replace(/([A-Z])/g, " $1").trim()} must be a valid number`;
    }

    // Exit Date validation - must be a valid date
    if (name === "exitDate" && value && isNaN(new Date(value).getTime())) {
      error = "Please enter a valid date";
    }

    // Relation validation - letters and spaces only
    if (name === "relation" && value && !/^[a-zA-Z\s]*$/.test(value)) {
      error = "Relation can only contain letters and spaces";
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData({ ...formData, [name]: value });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors({ ...errors, [name]: error });
    } else {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all required fields
    const requiredFields = [
      "formNo",
      "name",
      "fatherName",
      "designation",
      "depotName",
      "exitDate",
    ];
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Validate optional fields if they have values
    const optionalFields = [
      "lastBasicPay",
      "exgratiaAmount",
      "gratuityAmount",
      "leaveEncashmentAmount",
      "nominee",
      "relation",
    ];
    optionalFields.forEach((field) => {
      if (formData[field]) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all validation errors");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await employeeService.update(id, formData);
        toast.success("Employee updated successfully!");
      } else {
        await employeeService.create(formData);
        toast.success("Employee added successfully!");
      }
      navigate("/employee-list");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        isEditMode ? "Failed to update employee" : "Failed to add employee",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldConfigs = [
    {
      label: "Form Number",
      name: "formNo",
      icon: FileText,
      placeholder: "e.g., 1757 or ABC-123",
      required: true,
    },
    {
      label: "Employee Name",
      name: "name",
      icon: User,
      placeholder: "e.g., MAHENDRA KUMAR SHARMA",
      required: true,
    },
    {
      label: "Father's Name",
      name: "fatherName",
      icon: UserCircle,
      placeholder: "e.g., OMKAR LAL SHARMA",
      required: true,
    },
    {
      label: "Designation",
      name: "designation",
      icon: Briefcase,
      placeholder: "e.g., BA or COND",
      required: true,
    },
  ];

  const optionalFieldConfigs = [
    {
      label: "Last Basic Pay",
      name: "lastBasicPay",
      icon: DollarSign,
      placeholder: "e.g., 1530",
      required: false,
    },
    {
      label: "Exgratia Amount",
      name: "exgratiaAmount",
      icon: Award,
      placeholder: "e.g., 83178",
      required: false,
    },
    {
      label: "Gratuity Amount",
      name: "gratuityAmount",
      icon: Award,
      placeholder: "e.g., 93308",
      required: false,
    },
    {
      label: "Leave Encashment",
      name: "leaveEncashmentAmount",
      icon: DollarSign,
      placeholder: "e.g., 6931",
      required: false,
    },
    {
      label: "Nominee Name",
      name: "nominee",
      icon: Users,
      placeholder: "e.g., CHAND BEE",
      required: false,
    },
    {
      label: "Relation",
      name: "relation",
      icon: Heart,
      placeholder: "e.g., WIFE",
      required: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">{error}</h2>
          <button
            onClick={() => navigate("/employee-list")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-6 flex items-center justify-center py-4">
      <div className="w-full bg-white shadow-xl rounded-xl p-4 md:p-10 border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditMode ? "Edit Employee" : "Employee Work Sheet"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode
                ? "Update employee information"
                : "Add new employee details"}
            </p>
          </div>
          <button
            onClick={() => navigate("/employee-list")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Required Fields */}
            {fieldConfigs.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <field.icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={field.placeholder}
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg outline-none transition-colors ${
                      errors[field.name]
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors[field.name] && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={14} />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {/* Depot Name Dropdown - Required */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Depot Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  name="depotName"
                  value={formData.depotName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg outline-none appearance-none bg-white transition-colors ${
                    errors.depotName
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select Depot</option>
                  {depotOptions.map((depot) => (
                    <option key={depot} value={depot}>
                      {depot}
                    </option>
                  ))}
                </select>
              </div>
              {errors.depotName && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {errors.depotName}
                </p>
              )}
            </div>

            {/* Exit Date - Required */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Exit Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="exitDate"
                  value={formData.exitDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg outline-none transition-colors ${
                    errors.exitDate
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
              </div>
              {errors.exitDate && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {errors.exitDate}
                </p>
              )}
            </div>

            {/* Optional Fields */}
            {optionalFieldConfigs.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={field.placeholder}
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg outline-none transition-colors ${
                      errors[field.name]
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors[field.name] && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={14} />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={20} />
                  {isEditMode ? "Update Details" : "Submit Details"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/employee-list")}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
