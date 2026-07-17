import axiosInstance from "../utils/axiosConfig";

const employeeService = {
  create: async (payload) => {
    const response = await axiosInstance.post(
      "/employees/add-employee",
      payload,
    );
    return response;
  },
  update: async (payload) => {
    const response = await axiosInstance.put(
      "/employees/update-employee",
      payload,
    );
    return response;
  },
  delete: async (payload) => {
    const response = await axiosInstance.delete(
      "/employees/delete-employee",
      payload,
    );
    return response;
  },
  getAll: async () => {
    const response = await axiosInstance.get("/employees/get-employees");
    return response;
  },
};

export default employeeService;
