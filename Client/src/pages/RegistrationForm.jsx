import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import authService from "../services/authService";

const RegistrationForm = () => {
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    fullname: Yup.string().required("Full name is required"),

    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),

    password: Yup.string()
      .matches(
        /^[a-zA-Z0-9@#$&]*$/,
        "Only letters, numbers and @ # $ & are allowed",
      )
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),

    mobile: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Invalid mobile number")
      .required("Mobile is required"),

    address: Yup.string().required("Address is required"),

    profile_image: Yup.mixed()
      .required("Profile image is required")
      .test("fileType", "Only JPG, PNG, JPEG and WEBP allowed", (value) => {
        if (!value) return false;

        return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          value.type,
        );
      }),
  });

  const formik = useFormik({
    initialValues: {
      fullname: "",
      email: "",
      password: "",
      mobile: "",
      address: "",
      profile_image: null,
    },

    validationSchema,

    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);

        const formData = new FormData();

        formData.append("fullname", values.fullname);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("mobile", values.mobile);
        formData.append("address", values.address);
        formData.append("profile_image", values.profile_image);

        await authService.create(formData);

        toast.success("Admin created successfully.");

        resetForm();
      } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Create Admin</h2>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              value={formik.values.fullname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg p-3"
            />

            {formik.touched.fullname && formik.errors.fullname && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.fullname}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg p-3"
            />

            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg p-3"
            />

            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="mobile"
              placeholder="Mobile"
              value={formik.values.mobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg p-3"
            />

            {formik.touched.mobile && formik.errors.mobile && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.mobile}
              </p>
            )}
          </div>

          <div>
            <textarea
              rows="3"
              name="address"
              placeholder="Address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg p-3"
            />

            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.address}
              </p>
            )}
          </div>

          <div>
            <input
              type="file"
              name="profile_image"
              accept="image/*"
              onBlur={() => formik.setFieldTouched("profile_image", true)}
              onChange={(e) => {
                formik.setFieldValue("profile_image", e.currentTarget.files[0]);
              }}
            />

            {formik.touched.profile_image && formik.errors.profile_image && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.profile_image}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
