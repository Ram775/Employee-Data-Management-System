import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";

import Layout from "./layout/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
import EmployeeForm from "./pages/EmployeeForm";
import EmployeeList from "./pages/EmployeeList";

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes (Layout ke andar) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<AdminDashboard />} /> {/* Default page */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employee-form" element={<EmployeeForm />} />
          <Route path="employee-list" element={<EmployeeList />} />
        </Route>
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
