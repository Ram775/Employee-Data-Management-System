import axiosInstance from "../utils/axiosConfig";

const authService = {
  create: async (formData) => {
    return await axiosInstance.post("/admin/register-user", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response;
  },
  verifyOtp: async (credentials) => {
    const response = await axiosInstance.post("/auth/verify-otp", credentials);
    return response;
  },
  forgotPassword: async (credentials) => {
    const response = await axiosInstance.post(
      "/auth/forgot-password",
      credentials,
    );
    return response;
  },
  verifyForgotPasswordOtp: async (credentials) => {
    const response = await axiosInstance.post(
      "/auth/verify-forgot-otp",
      credentials,
    );
    return response;
  },
  resetPassword: async (credentials, resetToken) => {
    //  Token ko Authorization header me bhej rahe hain
    const response = await axiosInstance.post(
      "/auth/reset-password",
      credentials,
      {
        headers: {
          Authorization: `Bearer ${resetToken}`,
        },
      },
    );
    return response;
  },
};

export default authService;
