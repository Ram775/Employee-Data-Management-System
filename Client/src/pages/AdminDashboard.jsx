import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Sun,
  Moon,
  Cloud,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar as CalendarIcon,
} from "lucide-react";

import employeeService from "../services/employeeService";

const AdminDashboard = () => {
  // State for real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({});
  const [count, setCount] = useState(0);
  const BaseURL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employeeService.profile();
        console.log("Admin profile data:", res.data.data);
        const { fullname, email, role, mobile, address, profile_image } =
          res.data.data;

        setAdminUser({
          name: fullname,
          email: email,
          role: role,
          phone: mobile,
          location: address,
          joinDate: "January 2020",
          avatar:
            profile_image ||
            "https://i.pinimg.com/1200x/2d/93/14/2d9314606ed1f1487bb5308fd0f58df6.jpg",
        });

        const response = await employeeService.getCount();
        console.log("Employee count:", response.data.count);
        setCount(response.data.count);
      } catch (error) {
        console.error("Error in AdminDashboard useEffect:", error);
      }
    };

    fetchProfile();
  }, []);

  // Admin user data

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time with AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      return {
        text: "Good Morning",
        emoji: "🌅",
        icon: Sun,
        color: "text-amber-500",
        bgColor: "bg-amber-50",
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        text: "Good Afternoon",
        emoji: "☀️",
        icon: Sun,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        text: "Good Evening",
        emoji: "🌆",
        icon: Cloud,
        color: "text-indigo-500",
        bgColor: "bg-indigo-50",
      };
    } else {
      return {
        text: "Good Night",
        emoji: "🌙",
        icon: Moon,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
      };
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // Total records count (dummy data)
  const totalRecords = count; // Replace with actual count from your data source

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30     md:p-8">
      {/* Main Container */}
      <div className="w-full mx-auto">
        {/* Header Section with Greeting and Profile */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left - Greeting */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={`${BaseURL}${adminUser.avatar}`}
                    alt={adminUser.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg border-2 border-white object-cover"
                  />
                  <div className="absolute -bottom-1 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                {/* Greeting Text */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`p-1.5 rounded-lg ${greeting.bgColor}`}>
                      <GreetingIcon className={`w-4 h-4 ${greeting.color}`} />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                      {greeting.text},
                    </h2>
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {adminUser?.name?.split(" ")[0]}
                    </span>
                    <span className="text-lg sm:text-xl">{greeting.emoji}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <p className="text-sm text-gray-500">{adminUser.role}</p>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="hidden sm:inline">
                        {adminUser.email}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Clock & Actions */}
              <div className="flex items-center gap-3 sm:gap-4 ml-auto lg:ml-0 flex-wrap">
                {/* Real-time Clock */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border border-blue-100/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-sm sm:text-base font-bold text-gray-800 font-mono tracking-wide">
                        {formatTime(currentTime)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">
                        {formatDate(currentTime)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
            {/* Cover Image */}
            <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
              <div className="absolute -bottom-12 left-6 sm:left-8">
                <img
                  src={`${BaseURL}${adminUser.avatar}`}
                  alt={adminUser.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-14 sm:pt-16 pb-6 px-6 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {adminUser.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <UserCheck className="w-3.5 h-3.5" />
                      {adminUser.role}
                    </span>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      Joined {adminUser.joinDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-800">
                      {adminUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-800">
                      {adminUser.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-800">
                      {adminUser.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Records Card */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                  Total Records
                </p>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {totalRecords}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Employee records in system
                </p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
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
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
