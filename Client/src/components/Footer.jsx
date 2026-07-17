import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      {/* Brand Info */}
      <div>
        <h3 className="text-white text-lg font-bold mb-4">MyBrand</h3>
        <p className="text-sm leading-relaxed">
          Modern web solutions for your business. We build scalable and
          performant applications with the latest technologies.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
