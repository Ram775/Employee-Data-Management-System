import axiosInstance from "../utils/axiosConfig";

const employeeService = {
  // Get employee profile
  profile: async () => {
    const response = await axiosInstance.get("/profile");
    return response;
  },

  // Create new employee (backend auto-generates UUID)
  create: async (payload) => {
    const response = await axiosInstance.post(
      "/employees/add-employee",
      payload,
    );
    return response;
  },

  // Update employee by ID (UUID)
  update: async (id, payload) => {
    const response = await axiosInstance.put(
      `/employees/update-employee/${id}`, // ID in URL
      payload,
    );
    return response;
  },

  // Delete employee by ID (UUID)
  delete: async (id) => {
    const response = await axiosInstance.delete(
      `/employees/delete-employee/${id}`, // ID in URL
    );
    return response;
  },

  // Get all employees
  getAll: async () => {
    const response = await axiosInstance.get("/employees/get-employees");
    return response;
  },

  // Get employee count
  getCount: async () => {
    const response = await axiosInstance.get("/employees/employee-count");
    return response;
  },

  // Get single employee by ID
  getById: async (id) => {

    const response = await axiosInstance.get("/employees/get-employees");
    return response;
  },
};

export default employeeService;
