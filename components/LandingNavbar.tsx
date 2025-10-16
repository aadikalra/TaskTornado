import React from "react";
import Link from "next/link";

export default function LandingNavbar() {
  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#005f5a] dark:bg-gray-800 shadow-xl rounded-full px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between w-[90%] sm:w-[85%] max-w-4xl">
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Logo */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            <img
              src="/apple-touch-icon.png"
              alt="SchoolOrganizer Logo"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
            />
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <nav className="hidden sm:flex gap-6 text-white dark:text-gray-200 font-medium">
            <Link href="/changelog" className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors cursor-pointer">
              Changelog
            </Link>
          </nav>
        </div>

        <div className="flex items-center">
          <a
            href="/signup"
            className="bg-white dark:bg-gray-700 text-[#005f5a] dark:text-gray-200 font-medium px-4 sm:px-6 py-1.5 sm:py-2 rounded-full rounded-r-none shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="bg-white dark:bg-gray-700 text-[#005f5a] dark:text-gray-200 font-medium px-4 sm:px-6 py-1.5 sm:py-2 rounded-full rounded-l-none shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
          >
            Login
          </a>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />
    </>
  );
}
