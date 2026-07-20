import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-10 max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl text-center space-y-6">
        
        {/* Animated Badge Icon */}
        <div className="mx-auto w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 -10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002A11.959 11.959 0 0 1 12 2.964zM12 15.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Text Section */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Error 403
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Access Denied
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Oops! Aapke paas is page ko access karne ki permission nahi hai. Kripya apna role ya account check karein.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-all duration-200 active:scale-[0.98]"
          >
            Go Back
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 shadow-lg shadow-rose-500/20 transition-all duration-200 active:scale-[0.98]"
          >
            Home Page
          </button>
        </div>

      </div>
    </div>
  );
};

export default Unauthorized;