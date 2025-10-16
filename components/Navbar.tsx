'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { SearchTrigger } from './SearchBar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Menu,
  X,
  MessageSquare,
  Calendar,
  BookOpen,
  Bookmark,
  Settings,
  LogOut,
  LogIn,
  Home,
  Sparkles,
  Link2,
  Users,
  Timer,
  ToolCase,
  FileText,
} from 'lucide-react';
import { StudyTimer } from './StudyTimer';
import { MinimalistTimer } from './MinimalistTimer';
import { AIAssistant } from './AIAssistant';
import { Search } from './animate-ui/icons/search';

type XYChannel = 'R' | 'G' | 'B';

type Config = {
  radius: number;
  border: number;
  lightness: number;
  alpha: number;
  blur: number;
  scale: number;
  r: number;
  g: number;
  b: number;
  x: XYChannel;
  y: XYChannel;
  blend: string;
  displace: number;
  saturation: number;
  frost: number;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // Early return for auth pages - before any hooks that might cause issues
  if (isAuthPage) return null;

  // Theme and auth hooks
  const { isDark } = useDarkMode();
  const authContext = useAuth();
  const { user, signOut } = authContext || {};
  
  // Use dark or light logo based on theme
  const logoSrc = isDark ? '/TaskTornadoDark.svg' : '/TaskTornado.svg';

  // State hooks - called before any early returns
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isMinimalistTimerOpen, setIsMinimalistTimerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Liquid Glass refs and sizing
  const navRef = useRef<HTMLElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const feGaussianRef = useRef<SVGFEGaussianBlurElement>(null);
  const redDMRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenDMRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueDMRef = useRef<SVGFEDisplacementMapElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const cfg = useRef<Config>({
    radius: 16,
    border: 0.04,
    lightness: 80,
    alpha: 0.75,
    blur: 45,
    scale: -100,
    r: 0,
    g: 10,
    b: 20,
    x: 'R',
    y: 'G',
    blend: 'difference',
    displace: 0.35,
    saturation: 2.2,
    frost: 0.75,
  });

  const filterId = 'org-liquid-glass';

  const valuesRed =
    '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0';
  const valuesGreen =
    '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0';
  const valuesBlue =
    '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0';

  // Close mobile menu on route change and handle scroll
  useEffect(() => {
    const handleRouteChange = () => setIsMenuOpen(false);
    window.addEventListener('popstate', handleRouteChange);

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Measure nav and update on resize
  useEffect(() => {
    if (!navRef.current) return;
    const el = navRef.current;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: Math.ceil(rect.width), h: Math.ceil(rect.height) });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // Update backdrop when theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      if (size.w > 0 && size.h > 0) {
        // Force re-render of backdrop with new theme colors
        setSize(prev => ({ ...prev }));
      }
    };

    // Listen for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [size.w, size.h]);

  // Build displacement map when size changes
  useEffect(() => {
    if (!feImageRef.current || size.w === 0 || size.h === 0) return;

    const c = cfg.current;
    const w = size.w;
    const h = size.h;
    const border = Math.min(w, h) * (c.border * 0.5);

    // Use appropriate backdrop color based on theme
    const isDark = document.documentElement.classList.contains('dark');
    const backdropColor = isDark ? 'rgba(17, 24, 39, 0.05)' : 'rgba(255, 255, 255, 0.02)';
    const occlusionColor = isDark ? 'rgba(17, 24, 39, 0.15)' : 'rgba(255, 255, 255, 0.08)';

    const svg = `
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
        <defs>
          <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>

        <!-- backdrop -->
        <rect x="0" y="0" width="${w}" height="${h}" fill="${backdropColor}" />

        <!-- red linear -->
        <rect x="0" y="0" width="${w}" height="${h}" rx="${c.radius}" fill="url(#red)" />

        <!-- blue linear -->
        <rect x="0" y="0" width="${w}" height="${h}" rx="${c.radius}" fill="url(#blue)" style="mix-blend-mode:${c.blend}" />

        <!-- occlusion to keep distortion stronger around edges -->
        <rect
          x="${border}"
          y="${border}"
          width="${w - border * 2}"
          height="${h - border * 2}"
          rx="${c.radius}"
          fill="${occlusionColor}"
          style="filter: blur(${c.blur}px)"
        />
      </svg>
    `;

    const encoded = encodeURIComponent(svg);
    const dataUri = `data:image/svg+xml,${encoded}`;

    // Map + channels
    feImageRef.current.setAttribute('href', dataUri);
    redDMRef.current?.setAttribute('xChannelSelector', c.x);
    redDMRef.current?.setAttribute('yChannelSelector', c.y);
    greenDMRef.current?.setAttribute('xChannelSelector', c.x);
    greenDMRef.current?.setAttribute('yChannelSelector', c.y);
    blueDMRef.current?.setAttribute('xChannelSelector', c.x);
    blueDMRef.current?.setAttribute('yChannelSelector', c.y);

    // Per-channel scales
    redDMRef.current?.setAttribute('scale', String(c.scale + c.r));
    greenDMRef.current?.setAttribute('scale', String(c.scale + c.g));
    blueDMRef.current?.setAttribute('scale', String(c.scale + c.b));

    // Output gaussian blur
    feGaussianRef.current?.setAttribute('stdDeviation', String(c.displace));
  }, [size.w, size.h]);

  // Evermore-like palette + glass styles
  const cssVars: CSSProperties = {
    '--ink': '#0d330f',
    '--mist': '#f2f3f4',
    '--white': '#ffffff',
    '--g1': '#eaf6ff',
    '--g2': '#efe6ff',
    '--accent-purple': '#a88bff',
    '--shadow': '0 24px 80px rgba(13,32,51,.10), 0 6px 20px rgba(13,32,51,.06)',
    '--glass-bg-light': 'rgba(255,255,255, 0.1)',
    '--glass-bg-dark': 'rgba(17,24,39, 0.2)',
    '--backdrop-blur': 'blur(16px)',
  } as CSSProperties;

  const glassStyles: CSSProperties = {
    backgroundColor: 'var(--glass-bg-light)',
    backdropFilter: `url(#${filterId}) brightness(1.5) saturate(${cfg.current.saturation}) ${cfg.current.frost === 0.75 ? 'var(--backdrop-blur)' : ''}`,
    WebkitBackdropFilter: `blur(16px) saturate(${cfg.current.saturation}) brightness(1.5)`,
  };

  return (
    <>
      <style jsx>{`
        .dark [data-theme-aware="true"] {
          background-color: rgba(17, 24, 39, 0.2) !important;
        }
      `}</style>
      <TooltipProvider>
        <nav
          ref={navRef as any}
          className={`fixed top-3 md:top-4 left-1/2 -translate-x-1/2 z-50
            w-[96vw] max-w-7xl rounded-2xl border border-white/10 dark:border-gray-800/50
            bg-white/5 dark:bg-gray-900/20 backdrop-saturate-150 transition-all duration-300
            ${isScrolled ? 'shadow-xl' : 'shadow-md'}`}
          style={{
            ...cssVars,
            ...glassStyles,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--ink)',
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, sans-serif',
          }}
          data-theme-aware="true"
        >
          {/* Liquid Glass filter defs live inside the nav so url(#id) resolves */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <filter id={filterId} colorInterpolationFilters="sRGB">
                <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" result="map" />
                <feDisplacementMap
                  ref={redDMRef}
                  in="SourceGraphic"
                  in2="map"
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="dispRed"
                />
                <feColorMatrix in="dispRed" type="matrix" values={valuesRed} result="red" />
                <feDisplacementMap
                  ref={greenDMRef}
                  in="SourceGraphic"
                  in2="map"
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="dispGreen"
                />
                <feColorMatrix in="dispGreen" type="matrix" values={valuesGreen} result="green" />
                <feDisplacementMap
                  ref={blueDMRef}
                  in="SourceGraphic"
                  in2="map"
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="dispBlue"
                />
                <feColorMatrix in="dispBlue" type="matrix" values={valuesBlue} result="blue" />
                <feBlend in="red" in2="green" mode="screen" result="rg" />
                <feBlend in="rg" in2="blue" mode="screen" result="output" />
                <feGaussianBlur ref={feGaussianRef} in="output" stdDeviation={cfg.current.displace} />
              </filter>
            </defs>
          </svg>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
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
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex md:items-center md:space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SearchTrigger className="relative text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/20 hover:shadow-lg hover:scale-105" />
                  </TooltipTrigger>
                  <TooltipContent>Search</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setIsAIAssistantOpen(true)} className="relative p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-full transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/20 hover:shadow-lg hover:scale-105">
                      <Sparkles className="w-5 h-5" />
                      <span className="sr-only">Study Assistant</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Study Assistant</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/calendar"
                      className="relative p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-full transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/20 hover:shadow-lg hover:scale-105"
                    >
                      <Calendar className="w-5 h-5" />
                      <span className="sr-only">Calendar</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Calendar</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/flashcards"
                      className="relative p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-full transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/20 hover:shadow-lg hover:scale-105"
                    >
                      <BookOpen className="w-5 h-5" />
                      <span className="sr-only">Flashcards</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Flashcards</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/web-saves" className="relative p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-full transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/20 hover:shadow-lg hover:scale-105">
                      <Bookmark className="w-5 h-5" />
                      <span className="sr-only">Web Saves</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Web Saves</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setIsMinimalistTimerOpen(true)} className="relative p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-full transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/20 hover:shadow-lg hover:scale-105">
                      <Timer className="w-5 h-5" />
                      <span className="sr-only">Timer</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Timer</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/groups"
                      className="relative p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-full transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/20 hover:shadow-lg hover:scale-105"
                    >
                      <Users className="w-5 h-5" />
                      <span className="sr-only">Study Groups</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Study Groups</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/changelog"
                      className="relative p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-full transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/20 hover:shadow-lg hover:scale-105"
                    >
                      <FileText className="w-5 h-5" />
                      <span className="sr-only">Changelog</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Changelog</TooltipContent>
                </Tooltip>

                {user ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowLogoutModal(true)}
                        className="p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 hover:bg-red-500/20 rounded-full transition-colors"
                      >
                  <LogOut className="w-5 h-5" />
                        <span className="sr-only">Sign Out</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Sign Out</TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="flex items-center space-x-2 ml-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/login"
                          className="relative p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-full transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/20 hover:shadow-lg hover:scale-105"
                        >
                          <LogIn className="w-5 h-5" />
                          <span className="sr-only">Sign In</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Sign In</TooltipContent>
                    </Tooltip>
                    <Link
                      href="/signup"
                      className="px-3 py-1.5 text-sm font-medium text-white bg-[#1F48FF] hover:bg-[#1a3ee0] rounded-full transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="relative p-2 text-black hover:text-gray-200 rounded-full focus:outline-none transition-all duration-200 hover:bg-white/20 hover:shadow-lg hover:scale-105"
                  aria-expanded={isMenuOpen}
                >
                  <span className="sr-only">Open menu</span>
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
            <div
              className="pt-2 pb-3 space-y-1 border-t border-white/10 dark:border-gray-800/50 shadow-xl rounded-b-2xl"
              style={{
                ...glassStyles,
                backgroundColor: `rgba(255,255,255, ${Math.max(cfg.current.frost, 0.5)})`,
              }}
            >
              <div className="px-4 py-2">
                <SearchTrigger className="w-full" />
              </div>

              <button
                onClick={() => {
                  setIsAIAssistantOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-800 dark:text-black hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/30"
              >
                <MessageSquare className="w-5 h-5 mr-3 text-black" />
                AI Assistant
              </button>

              <Link
                href="/"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-black hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/30"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Home className="w-5 h-5 mr-3 text-black" />
                  Home
                </div>
              </Link>

              <Link
                href="/calendar"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-black hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/30"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-black" />
                  Calendar
                </div>
              </Link>

              <Link
                href="/flashcards"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-black hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/30"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-3 text-black" />
                  Flashcards
                </div>
              </Link>

              <Link
                href="/web-saves"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-black hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/30"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Bookmark className="w-5 h-5 mr-3 text-black" />
                  Web Saves
                </div>
              </Link>

              <Link
                href="/settings"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-black hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/30"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-3 text-black" />
                  Settings
                </div>
              </Link>

              <Link
                href="/changelog"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-black hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/30"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-3 text-black" />
                  Changelog
                </div>
              </Link>

              <div className="py-3">
                <StudyTimer
                  trigger={
                    <button className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-800 dark:text-black hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-md">
                      <Timer className="w-5 h-5 mr-3 text-black" />
                      Study Timer
                    </button>
                  }
                />
              </div>

              {user ? (
                <button
                  onClick={() => {
                    setShowLogoutModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50/70 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-5 h-5 mr-3 text-red-500" />
                  Sign Out
                </button>
              ) : (
                <div className="px-4 py-3 space-y-2 border-t border-white/10 dark:border-gray-800/50">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-[#1F48FF] hover:bg-[#1a3ee0] rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </TooltipProvider>

      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
      <MinimalistTimer
        isVisible={isMinimalistTimerOpen}
        onClose={() => setIsMinimalistTimerOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Sign out?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Are you sure you want to sign out? You'll need to log in again to access your account.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    signOut?.();
                    setShowLogoutModal(false);
                    router.push('/');
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}