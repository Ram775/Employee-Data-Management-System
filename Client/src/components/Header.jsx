import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, User, Users, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const loggedInUser = decoded?.role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setIsMenuOpen(false);
  };

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <ShieldCheck size={20} />
            </div>
            EMS Portal
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>
            <NavLink to="/employee-form" active={isActive("/employee-form")}>Add Employee</NavLink>
            {loggedInUser === "superadmin" && (
              <NavLink to="/create-User" active={isActive("/create-User")}>Admin Tools</NavLink>
            )}
            <NavLink to="/employee-list" active={isActive("/employee-list")}>Directory</NavLink>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-sm font-semibold transition-all duration-300"
          >
            <LogOut size={16} /> Logout
          </button>

          {/* Mobile Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-white border-b border-gray-200 p-4 space-y-2 animate-in slide-in-from-top-5">
          <MobileLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</MobileLink>
          <MobileLink to="/employee-form" onClick={() => setIsMenuOpen(false)}>Add Employee</MobileLink>
          <MobileLink to="/employee-list" onClick={() => setIsMenuOpen(false)}>Directory</MobileLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-red-600 font-medium">
            <LogOut size={20} /> Logout
          </button>
        </div>
      )}
    </header>
  );
};

// Component: Desktop Nav Link
const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
      active ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
    }`}
  >
    {children}
  </Link>
);

// Component: Mobile Nav Link
const MobileLink = ({ to, children, onClick }) => (
  <Link to={to} onClick={onClick} className="block px-4 py-3 text-gray-700 font-medium hover:bg-indigo-50 rounded-lg">
    {children}
  </Link>
);

export default Header;