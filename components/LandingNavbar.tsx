'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // Show background after scrolling 50px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 mx-auto flex items-center justify-between px-4 py-2 transition-all duration-300 rounded-xl ${
      isScrolled ? 'bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20 mt-2 w-[90%]' : 'bg-transparent'
    }`}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
        <div className="flex gap-1">
          <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-black dark:bg-white inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-black dark:bg-white inline-block"></span>
        </div>  
        ChronoTask
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex gap-8 text-gray-700 dark:text-gray-300 text-sm">
        <a href="/#features" className="hover:text-black dark:hover:text-white">Features</a>
        <Link href="/ai-guidelines" className="hover:text-black dark:hover:text-white">AI Guidelines</Link>
        <Link href="/changelog" className="hover:text-black dark:hover:text-white">Changelog</Link>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-6 text-sm">
        <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
          Sign in
        </Link>
        <Link href="/signup" className="border border-gray-300 dark:border-gray-600 rounded-lg px-5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
