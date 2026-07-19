import React from "react";
import { Mail, Phone, MapPin,  ArrowUp } from "lucide-react";

const Footer = () => {
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-950 text-gray-400 relative">
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h3 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              MyBrand
            </h3>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs mx-auto sm:mx-0">
              Modern web solutions for your business. We build scalable and
              performant applications with the latest technologies.
            </p>
            {/* Social Icons - Mobile visible */}
            
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h4 className="text-white font-semibold text-base sm:text-lg">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors inline-block">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors inline-block">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors inline-block">
                  Projects
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors inline-block">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors inline-block">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h4 className="text-white font-semibold text-base sm:text-lg">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <Mail size={18} className="text-indigo-400 flex-shrink-0" />
                <span className="break-all">hello@mybrand.com</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <Phone size={18} className="text-indigo-400 flex-shrink-0" />
                <span className="whitespace-nowrap">+91 98765 43210</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <MapPin size={18} className="text-indigo-400 flex-shrink-0" />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h4 className="text-white font-semibold text-base sm:text-lg">
              Newsletter
            </h4>
            <p className="text-sm text-gray-400">
              Subscribe to get updates about our latest projects and offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-500 text-sm transition-all"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MyBrand. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs">
            <a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;