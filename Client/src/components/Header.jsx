import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const loggedInUser = decoded?.role;

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    setIsMenuOpen(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
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
              <NavLink to="/dashboard" active={isActive("/dashboard")}>
                Dashboard
              </NavLink>
              <NavLink to="/employee-form" active={isActive("/employee-form")}>
                Add Employee
              </NavLink>
              {loggedInUser === "superadmin" && (
                <NavLink to="/create-User" active={isActive("/create-User")}>
                  Admin Tools
                </NavLink>
              )}
              <NavLink to="/employee-list" active={isActive("/employee-list")}>
                Employee List
              </NavLink>
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogoutClick}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-sm font-semibold transition-all duration-300"
            >
              <LogOut size={16} /> Logout
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-white border-b border-gray-200 p-4 space-y-2 animate-in slide-in-from-top-5">
            <MobileLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </MobileLink>
            <MobileLink
              to="/employee-form"
              onClick={() => setIsMenuOpen(false)}
            >
              Add Employee
            </MobileLink>
            <MobileLink
              to="/employee-list"
              onClick={() => setIsMenuOpen(false)}
            >
              Employee List
            </MobileLink>
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2 px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        )}
      </header>

      {/* Custom Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Confirm Logout
                </h3>
              </div>
              <button
                onClick={handleCancelLogout}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoggingOut}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    Are you sure you want to logout?
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    You will need to login again to access your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Component: Desktop Nav Link
const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
      active
        ? "text-indigo-600 bg-indigo-50"
        : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
    }`}
  >
    {children}
  </Link>
);

// Component: Mobile Nav Link
const MobileLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-3 text-gray-700 font-medium hover:bg-indigo-50 rounded-lg"
  >
    {children}
  </Link>
);

export default Header;
