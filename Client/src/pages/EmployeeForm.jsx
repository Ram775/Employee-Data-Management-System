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
  CreditCard,
  Building,
  AlertTriangle,
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
    bankAccountNumber: "",
    ifscCode: "",
    vrs: "",
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

  // VRS/Retirement/Dismiss options
  const vrsOptions = ["VRS", "Retirement", "Dismiss"];

  // Relation options
  const relationOptions = ["Husband", "Wife", "Son", "Daughter"];

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
        console.log("Fetched employee data:", employee);
        
        // Normalize dropdown values to match options
        const depotValue = employee[5] || "";
        const vrsValue = employee[15] || "";
        const relationValue = employee[12] || "";

        // Find matching depot option (case insensitive)
        const matchedDepot = depotOptions.find(
          option => option.toLowerCase() === depotValue.toLowerCase().trim()
        ) || depotValue;

        // Find matching VRS option (case insensitive)
        const matchedVrs = vrsOptions.find(
          option => option.toLowerCase() === vrsValue.toLowerCase().trim()
        ) || vrsValue;

        // Find matching Relation option (case insensitive)
        const matchedRelation = relationOptions.find(
          option => option.toLowerCase() === relationValue.toLowerCase().trim()
        ) || relationValue;

        // Format date from YYYY-MM-DD to DD/MM/YYYY for display
        let exitDateValue = employee[6] || "";
        if (exitDateValue) {
          // Check if date is in YYYY-MM-DD format
          if (exitDateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const parts = exitDateValue.split('-');
            exitDateValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }

        setFormData({
          formNo: employee[1] || "",
          name: employee[2] || "",
          fatherName: employee[3] || "",
          designation: employee[4] || "",
          depotName: matchedDepot,
          exitDate: exitDateValue,
          lastBasicPay: employee[7] || "",
          exgratiaAmount: employee[8] || "",
          gratuityAmount: employee[9] || "",
          leaveEncashmentAmount: employee[10] || "",
          nominee: employee[11] || "",
          relation: matchedRelation,
          bankAccountNumber: employee[13] || "",
          ifscCode: employee[14] || "",
          vrs: matchedVrs,
        });
      } else {
        setError("Employee not found");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data");
      toast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  // Format date from DD/MM/YYYY to YYYY-MM-DD for API
  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return "";
    // If already in YYYY-MM-DD format, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    // Convert from DD/MM/YYYY to YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
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
      "vrs",
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
                  : name === "exitDate"
                    ? "Exit Date"
                    : "VRS/Retirement/Dismiss"
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

    // Bank Account Number validation - only digits (optional)
    if (name === "bankAccountNumber" && value) {
      if (!/^\d+$/.test(value)) {
        error = "Bank Account Number can only contain digits";
      } else if (value.length < 9 || value.length > 18) {
        error = "Bank Account Number should be between 9 to 18 digits";
      }
    }

    // IFSC Code validation - alphanumeric (11 characters) (optional)
    if (name === "ifscCode" && value) {
      if (!/^[A-Za-z0-9]{11}$/.test(value)) {
        error = "IFSC Code must be exactly 11 alphanumeric characters";
      }
    }

    // Exit Date validation - DD/MM/YYYY format
    if (name === "exitDate" && value) {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!dateRegex.test(value)) {
        error = "Please enter date in DD/MM/YYYY format";
      } else {
        const [, day, month, year] = value.match(dateRegex);
        const dateObj = new Date(`${year}-${month}-${day}`);
        if (isNaN(dateObj.getTime())) {
          error = "Please enter a valid date";
        }
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For exitDate, allow only DD/MM/YYYY format with automatic slashes
    if (name === "exitDate") {
      // Remove non-numeric characters
      let cleaned = value.replace(/[^0-9]/g, '');
      
      // Auto-format as DD/MM/YYYY
      if (cleaned.length > 2 && cleaned.length <= 4) {
        cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
      } else if (cleaned.length > 4 && cleaned.length <= 6) {
        cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4);
      } else if (cleaned.length > 6) {
        cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
      }
      
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }

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
      "vrs",
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
      "bankAccountNumber",
      "ifscCode",
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

    // Prepare data for API - convert date to YYYY-MM-DD
    const submitData = {
      ...formData,
      exitDate: formatDateForAPI(formData.exitDate),
    };

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await employeeService.update(id, submitData);
        toast.success("Employee updated successfully!");
      } else {
        await employeeService.create(submitData);
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
      label: "Bank Account Number",
      name: "bankAccountNumber",
      icon: CreditCard,
      placeholder: "e.g., 1112211113115",
      required: false,
    },
    {
      label: "IFSC Code",
      name: "ifscCode",
      icon: Building,
      placeholder: "e.g., SBIN0000474",
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

            {/* Exit Date - Required with DD/MM/YYYY format */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Exit Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="exitDate"
                  value={formData.exitDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
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

            {/* VRS/Retirement/Dismiss Dropdown - Required */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                VRS/Retirement/Dismiss <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  name="vrs"
                  value={formData.vrs}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg outline-none appearance-none bg-white transition-colors ${
                    errors.vrs
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select Type</option>
                  {vrsOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {errors.vrs && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {errors.vrs}
                </p>
              )}
            </div>

            {/* Relation Dropdown - Optional */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Relation
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  name="relation"
                  value={formData.relation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg outline-none appearance-none bg-white transition-colors ${
                    errors.relation
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select Relation</option>
                  {relationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {errors.relation && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {errors.relation}
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