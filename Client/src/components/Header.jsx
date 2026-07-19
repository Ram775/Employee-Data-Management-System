import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, Users, LogOut, Menu, X } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const loggedInUser = decoded.role;
  console.log("Logged-in user role:", loggedInUser);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setIsMenuOpen(false); 

  const handleNavigation = () => {
    setIsMenuOpen(false); // Navigation ke baad mobile menu close karo
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Responsive text */}
          <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-indigo-600 truncate">
            Employee Data Management System 
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
            />
            <NavItem
              to="/employee-form"
              icon={<User size={18} />}
              label="Employee Form"
            />

            {loggedInUser === "superadmin" && (
              <NavItem
                to="/create-User"
                icon={<User size={18} />}
                label="Create User"
              />
            )}

            <NavItem
              to="/employee-list"
              icon={<Users size={18} />}
              label="Employee List"
            />
          </nav>

          {/* Desktop Logout Button - Hidden on mobile */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors text-sm lg:text-base"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Mobile Menu Panel */}
            <div className="absolute left-0 right-0 top-16 bg-white border-b border-gray-200 shadow-lg z-50 md:hidden animate-slideDown">
              <nav className="flex flex-col p-4 space-y-2">
                <MobileNavItem
                  to="/dashboard"
                  icon={<LayoutDashboard size={20} />}
                  label="Dashboard"
                  onClick={handleNavigation}
                />
                <MobileNavItem
                  to="/employee-form"
                  icon={<User size={20} />}
                  label="Employee Form"
                  onClick={handleNavigation}
                />
                {loggedInUser === "superadmin" && (
                  <MobileNavItem
                    to="/create-User"
                    icon={<User size={20} />}
                    label="Create User"
                    onClick={handleNavigation}
                  />
                )}

                <MobileNavItem
                  to="/employee-list"
                  icon={<Users size={20} />}
                  label="Employee List"
                  onClick={handleNavigation}
                />

                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

// Desktop NavItem
const NavItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

// Mobile NavItem
const MobileNavItem = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors font-medium"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

}
export default Header;
