import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkDarkMode = () => {
      try {
        if (typeof window !== 'undefined') {
          if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
          } else {
            setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
          }
        }
      } catch (error) {
        console.warn('Dark mode context not available, defaulting to light mode');
        setIsDark(false);
      }
    };

    checkDarkMode();

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const logoSrc = isDark ? '/TaskTornadoDark.svg' : '/TaskTornado.svg';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-3' : 'py-4'
    }`}>
      <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-full shadow-sm px-6 py-3' 
          : 'bg-transparent'
      }`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <div className="w-8 h-8 relative">
            <Image
              src={logoSrc}
              alt="TaskTornado Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
              onError={(e) => {
                console.log('Logo failed to load');
                e.currentTarget.src = isDark
                  ? '/TaskTornado.svg'
                  : '/TaskTornadoDark.svg';
              }}
            />
          </div>
          <span className="hidden sm:inline">TaskTornado</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <a 
            href="/#features" 
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            Features
          </a>
          <Link 
            href="/ai-guidelines" 
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            AI Guidelines
          </Link>
          <Link 
            href="/changelog" 
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            Changelog
          </Link>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            Sign in
          </Link>
          <Link 
            href="/signup" 
            className="px-5 py-2 text-sm bg-[#275085] hover:bg-[#1f3d6b] dark:bg-[#275085] dark:hover:bg-[#1f3d6b] text-white font-medium rounded-full transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}