import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <div className="w-full h-screen dark:hidden relative">
        <img 
          src="/404_Page.png" 
          alt="404 Page Not Found" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
          <h1 className="text-6xl font-bold text-[#275085]">404</h1>
        </div>
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <Link 
            href="/" 
            className="px-8 py-3 bg-[#275085]/90 backdrop-blur-md text-white rounded-full font-semibold hover:bg-[#275085] transition-colors shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30"
          >
            Back Home
          </Link>
        </div>
      </div>
      <div className="w-full h-screen hidden dark:block relative">
        <img 
          src="/404_Page_Dark.png" 
          alt="404 Page Not Found" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
          <h1 className="text-6xl font-bold text-white">404</h1>
        </div>
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <Link 
            href="/" 
            className="px-8 py-3 bg-[#275085]/90 backdrop-blur-md text-white rounded-full font-semibold hover:bg-[#275085] transition-colors shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30"
          >
            Back Home
          </Link>
        </div>
      </div>
    </>
  );
}