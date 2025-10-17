import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // Show background after scrolling 50px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Safely check for dark mode preference
  useEffect(() => {
    const checkDarkMode = () => {
      try {
        // Check if document is available (client-side)
        if (typeof window !== 'undefined') {
          // Check if dark mode is already applied to document
          if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
          } else {
            // Check system preference
            setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
          }
        }
      } catch (error) {
        // Fallback to light mode if context is not available
        console.warn('Dark mode context not available, defaulting to light mode');
        setIsDark(false);
      }
    };

    checkDarkMode();

    // Listen for system preference changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Use dark or light logo based on theme
  const logoSrc = isDark ? '/TaskTornadoDark.svg' : '/TaskTornado.svg';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 mx-auto flex items-center justify-between px-4 py-2 transition-all duration-300 rounded-xl ${
      isScrolled ? 'bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20 mt-2 w-[90%]' : 'bg-transparent'
    }`}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
        <div className="w-8 h-8 relative">
          <Image
            src={logoSrc}
            alt="TaskTornado Logo"
            width={80}
            height={80}
            className="w-full h-full object-contain"
            priority
            onError={(e) => {
              console.log('Logo failed to load');
              // Fallback to default logo if dark/light specific one fails
              e.currentTarget.src = isDark
                ? '/TaskTornado.svg'
                : '/TaskTornadoDark.svg';
            }}
          />
        </div>
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
