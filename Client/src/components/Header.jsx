import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Link aur useNavigate import kiya
import { LayoutDashboard, User, Users, LogOut } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Token delete karo
    navigate("/login"); // Login page par bhej do
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-xl font-bold text-indigo-600">MyBrand</div>

          <nav className="flex space-x-8">
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
            />
            <NavItem to="/employee-form" icon={<User size={20} />} label="Employee Form" />
            <NavItem to="/employee-list" icon={<Users size={20} />} label="Employee List" />
          </nav>

          <button
            onClick={handleLogout} // Logout function add kiya
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

// NavItem mein 'to' prop pass kiya Link ke liye
const NavItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Header;
