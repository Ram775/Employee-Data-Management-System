import axiosInstance from "../utils/axiosConfig";

const authService = {
  login: async (credentials) => {
   
      const response = await axiosInstance.post("/auth/login", credentials);
      return response;
     
  }
};

export default authService;
