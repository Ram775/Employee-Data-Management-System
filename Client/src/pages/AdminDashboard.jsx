import React from "react";
import {
  Users,
  UserCheck,
  UserMinus,
  Briefcase,
  CheckCircle,
  Clock,
  Building,
  TrendingUp,
  BarChart,
  Calendar,
} from "lucide-react";

const AdminDashboard = () => {
  // Dummy Data with proper structure for card display
  const stats = [
    {
      title: "Total Employees",
      count: 120,
      male: 70,
      female: 50,
      icon: Users,
      color: "bg-blue-400",
    },
    {
      title: "Total Projects",
      count: 45,
      active: 30,
      completed: 15,
      icon: Briefcase,
      color: "bg-purple-400",
    },
    {
      title: "Department",
      count: 12,
      hr: 2,
      tech: 10,
      icon: Building,
      color: "bg-green-400",
    },
  ];

  return (
    <div className="app_card p-4 bg-[#f8f9fa] min-h-screen">
      {/* Admin Profile Section */}
      <div className="car_header mx-auto">
        <div className="mb-6 flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome, Admin</h2>
            <p className="text-gray-500 text-sm">Shreeram Singraul</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            SS
          </div>
        </div>

        {/* Dashboard Statistics Cards - Dynamic */}
        <div className="mb-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow group"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[11px] uppercase font-bold text-gray-600 mb-1 truncate tracking-tight">
                      {item.title}
                    </p>
                    <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                      {item.count}
                    </h3>

                    {/* Conditional Gender Display */}
                    {item.male !== undefined && (
                      <div className="flex gap-3 text-xs mt-1">
                        <span className="text-blue-600 font-medium">
                          👤 Male: {item.male}
                        </span>
                        <span className="text-pink-600 font-medium">
                          👤 Female: {item.female}
                        </span>
                      </div>
                    )}

                    {/* Conditional Project Display */}
                    {item.active !== undefined && (
                      <div className="flex gap-3 text-xs mt-1">
                        <span className="text-green-600 font-medium">
                          ✅ Active: {item.active}
                        </span>
                        <span className="text-gray-600 font-medium">
                          ✅ Completed: {item.completed}
                        </span>
                      </div>
                    )}

                    {/* Conditional Department Display */}
                    {item.hr !== undefined && (
                      <div className="flex gap-3 text-xs mt-1">
                        <span className="text-blue-600 font-medium">
                          HR: {item.hr}
                        </span>
                        <span className="text-purple-600 font-medium">
                          Tech: {item.tech}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-2 rounded-lg ${item.color} text-white shadow-sm flex-shrink-0`}
                  >
                    <IconComponent className="text-current" size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Info Section (Optional) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            Quick Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Staff</p>
                <p className="text-sm font-bold text-gray-800">120</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Projects</p>
                <p className="text-sm font-bold text-gray-800">30</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completion Rate</p>
                <p className="text-sm font-bold text-gray-800">33%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Departments</p>
                <p className="text-sm font-bold text-gray-800">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
