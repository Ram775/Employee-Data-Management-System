import React from "react";
import { Mail, Phone, MapPin, ArrowUp, Building2, Users, FileText } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 relative pt-16 pb-8 border-t border-slate-800">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-2"
      >
        <ArrowUp size={20} />
      </button>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & System Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white text-xl font-bold">
              <Building2 className="text-blue-500" />
              <span>EMS Portal</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Streamlining workforce management with precision. Empowering organizations to manage employee records, attendance, and payroll efficiently.
            </p>
          </div>

        

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold uppercase tracking-wider text-sm">Support</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-500" />
                <span>support@ems.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-blue-500" />
                <span>+91 1800-EMS-HELP</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-blue-500" />
                <span>Bhopal, India</span>
              </div>
            </div>
          </div>

      
         
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Employee Management System . All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-white cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;