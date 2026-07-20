import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Sun,
  Moon,
  Cloud,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Briefcase,
} from "lucide-react";
import employeeService from "../services/employeeService";
import hindiQuotes from "../data/hindi_quotes.json";
import englishQuotes from "../data/english_quotes.json";

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminUser, setAdminUser] = useState({
    name: "Loading...",
    email: "Loading...",
    role: "Admin",
    phone: "...",
    location: "...",
    joinDate: "...",
    avatar: "/default-avatar.png", // Public folder se path
  });
  const [count, setCount] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [englishQuoteIndex, setEnglishQuoteIndex] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employeeService.profile();
        const { fullname, email, role, mobile, address } = res.data.data;
        setAdminUser({
          name: fullname,
          email,
          role,
          phone: mobile,
          location: address,
          joinDate: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          avatar: "/profile.jpg", // Public folder se image
        });

        const response = await employeeService.getCount();
        setCount(response.data.count);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };
    fetchProfile();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12)
      return { text: "Good Morning", icon: Sun, color: "text-amber-400" };
    if (hour < 17)
      return { text: "Good Afternoon", icon: Sun, color: "text-orange-400" };
    return { text: "Good Evening", icon: Moon, color: "text-indigo-400" };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % hindiQuotes.length);
    }, 600000);

    return () => clearInterval(quoteInterval);
  }, []);

  const currentQuote = hindiQuotes[currentQuoteIndex];
  useEffect(() => {
    const englishquoteInterval = setInterval(() => {
      setCurrentQuoteIndex(
        (prevIndex) => (prevIndex + 1) % englishQuotes.length,
      );
    }, 600000);

    return () => clearInterval(englishquoteInterval);
  }, []);

  const englishQuote = englishQuotes[englishQuoteIndex];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8">
      {/* Top Header Glass Card */}
      <div className="relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-white/50 p-6 rounded-3xl shadow-xl shadow-blue-500/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={adminUser.avatar}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white"
                alt="Profile"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div
                className={`flex items-center gap-2 ${greeting.color} font-medium`}
              >
                <GreetingIcon size={18} /> {greeting.text}
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {adminUser.name}
              </h1>
            </div>
          </div>

          <div className="px-15   rounded-2xl text-center">
            {/* Day aur Date ke liye section */}
            <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
              {currentTime.toLocaleDateString("en-US", { weekday: "long" })}
            </div>
            <div className="text-sm font-semibold text-gray-900 mb-1">
              {currentTime.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            {/* Time ke liye section */}
            <div className=" text-2xl font-black text-slate-800">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Stats */}
        <div className="md:col-span-2 bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <UserCheck className="text-blue-600" /> Admin Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoItem icon={Mail} label="Email" value={adminUser.email} />
            <InfoItem icon={Phone} label="Phone" value={adminUser.phone} />
            <InfoItem
              icon={MapPin}
              label="Location"
              value={adminUser.location}
            />
            <InfoItem
              icon={CalendarIcon}
              label="Joined"
              value={adminUser.joinDate}
            />
          </div>
        </div>

        {/* Count Card - Futuristic Look */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/30 flex flex-col justify-between">
          <div>
            <Users size={32} className="mb-4 opacity-80" />
            <h4 className="text-blue-100 font-medium uppercase tracking-widest text-sm">
              Total Employees
            </h4>
          </div>
          <div className="text-6xl font-black">{count}</div>
        </div>
      </div>
      <div className="bg-white/90 backdrop-blur-xl border border-indigo-100 p-6 rounded-3xl shadow-lg flex items-start gap-6 hover:shadow-2xl transition-shadow duration-300">
        {/* Icon container - Thoda bada aur clear */}
        <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl text-white shadow-xl shadow-indigo-200">
          <Briefcase size={28} />
        </div>

        {/* Text container */}
        <div>
          <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-2">
            आज का सुविचार
          </p>

          {/* Quote - Readable text size (text-lg) aur bold weight */}
          <p className="text-lg md:text-xl font-semibold text-slate-900 leading-relaxed italic">
            "{currentQuote.quote}"
          </p>

          {/* Author - Darker color taaki dhundhla na dikhe */}
          <p className="text-sm text-slate-600 mt-3 font-bold border-t border-slate-200 pt-2 inline-block">
            — {currentQuote.author}
          </p>
        </div>
      </div>
      <div className="bg-white/90 backdrop-blur-xl border border-indigo-100 p-6 rounded-3xl shadow-lg flex items-start gap-6 hover:shadow-2xl transition-shadow duration-300">
        {/* Icon container - Thoda bada aur clear */}
        <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl text-white shadow-xl shadow-indigo-200">
          <Briefcase size={28} />
        </div>

        {/* Text container */}
        <div>
          <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-2">
            Today's wise thought
          </p>

          {/* Quote - Readable text size (text-lg) aur bold weight */}
          <p className="text-lg md:text-xl font-semibold text-slate-900 leading-relaxed italic">
            "{englishQuote.quote}"
          </p>

          {/* Author - Darker color taaki dhundhla na dikhe */}
          <p className="text-sm text-slate-600 mt-3 font-bold border-t border-slate-200 pt-2 inline-block">
            — {englishQuote.author}
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
