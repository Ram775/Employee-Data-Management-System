import React, { useState } from "react";
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
} from "lucide-react";
import employeeService from "../services/employeeService";

const EmployeeForm = () => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await employeeService.create(formData);
      alert("Employee successfully added!");
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
    } catch (error) {
      alert("Error: Data submit nahi ho paya.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldConfigs = [
    { label: "EPF Account No.", name: "epfNo", icon: Key },
    { label: "UAN", name: "uan", icon: FileText },
    { label: "PPO No.", name: "ppoNo", icon: UserCheck },
    { label: "Employee Name", name: "name", icon: User },
    { label: "Father's Name", name: "fatherName", icon: UserCircle },
    { label: "Designation", name: "designation", icon: Briefcase },
  ];

  return (
    <div className="bg-slate-50 py-8 px-4 flex items-center justify-center ">
      <div className="w-full  bg-white shadow-xl rounded-2xl p-6 md:p-10 border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-xl text-white">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Employee Work Sheet
            </h2>
            <p className="text-sm text-gray-500">M.P. Road Transport Corp.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Text Inputs */}
            {fieldConfigs.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    name={field.name}
                    required
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              </div>
            ))}

            {/* Native Date Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Living Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="livingDate"
                  required
                  value={formData.livingDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Exit Date
              </label>
              <div className="relative">
                <LogOut className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="exitDate"
                  required
                  value={formData.exitDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition uppercase"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Details"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
