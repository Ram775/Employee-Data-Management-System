import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header - Fixed position handle karne ke liye pt (padding-top) ki zarurat hoti hai */}
      <Header />

    
      <main className="flex-grow pt-20 pb-12">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
