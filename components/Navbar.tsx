'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { SearchTrigger } from './SearchBar';
import IconCalendar from './glass-icons/IconCalendar';
import IconBookOpen from './glass-icons/IconBookOpen';
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
import IconPin from './glass-icons/IconPin';
import IconSparkle from './glass-icons/IconSparkle';
import IconUsers from './glass-icons/IconUsers';
import IconFile from './glass-icons/IconFile';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // Early return for auth pages
  if (isAuthPage) return null;

  // Theme and auth hooks
  const { isDark } = useDarkMode();
  const authContext = useAuth();
  const { user, signOut } = authContext || {};

  const logoSrc = '/TaskTornadoChristmas.png';

  // State hooks
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isMinimalistTimerOpen, setIsMinimalistTimerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navRef = useRef<HTMLElement>(null);

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

  return (
    <>
      <TooltipProvider>
        <nav
          ref={navRef}
          className={`fixed top-3 md:top-4 left-1/2 -translate-x-1/2 z-50
            w-[96vw] max-w-7xl rounded-2xl transition-all duration-300
            ${isScrolled ? 'shadow-2xl' : 'shadow-lg'}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <Image
                      src={logoSrc}
                      alt="TaskTornado Logo"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                      priority
                      onError={(e) => {
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
                    <SearchTrigger className="relative p-2.5 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110" />
                  </TooltipTrigger>
                  <TooltipContent
                    className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                    sideOffset={8}
                  >
                    Search
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsAIAssistantOpen(true)}
                      className="relative p-2.5 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-300  hover:scale-110 group"
                    >
                      <IconSparkle />
                      <span className="sr-only">Study Assistant</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                    sideOffset={8}
                  >
                    AI Assistant
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/calendar"
                      className="relative p-2.5 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110"
                    >
                      <IconCalendar />
                      <span className="sr-only">Calendar</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                    sideOffset={8}
                  >
                    Calendar
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/flashcards"
                      className="relative p-2.5 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110"
                    >
                      <IconBookOpen />
                      <span className="sr-only">Flashcards</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                    sideOffset={8}
                  >
                    Flashcards
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/web-saves"
                      className="relative p-2.5 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110"
                    >
                      <IconPin />
                      <span className="sr-only">Web Saves</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                    sideOffset={8}
                  >
                    Web Saves
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsMinimalistTimerOpen(true)}
                      className="relative p-2.5 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110"
                    >
                      <Timer className="w-5 h-5" />
                      <span className="sr-only">Timer</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                    sideOffset={8}
                  >
                    Study Timer
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/groups"
                      className="relative p-2.5 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110"
                    >
                      <IconUsers />
                      <span className="sr-only">Group Chats</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                    sideOffset={8}
                  >
                    Group Chats
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/changelog"
                      className="relative p-2.5 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110"
                    >
                      <IconFile />
                      <span className="sr-only">Changelog</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                    sideOffset={8}
                  >
                    What's New
                  </TooltipContent>
                </Tooltip>

                {/* Divider */}
                <div className="w-px h-6 bg-white/20 dark:bg-gray-700/50 mx-1" />

                {user ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowLogoutModal(true)}
                        className="p-2.5 text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-300 hover:bg-red-500/10 hover:scale-110"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="sr-only">Sign Out</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                      sideOffset={8}
                    >
                      Sign Out
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="flex items-center space-x-2 ml-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/login"
                          className="relative p-2.5 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110"
                        >
                          <LogIn className="w-5 h-5" />
                          <span className="sr-only">Sign In</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        className="bg-gray-900/90 dark:bg-gray-800/90 text-white border-white/10 backdrop-blur-xl"
                        sideOffset={8}
                      >
                        Sign In
                      </TooltipContent>
                    </Tooltip>
                    <Link
                      href="/signup"
                      className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
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
                  className="relative p-2 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 rounded-xl focus:outline-none transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110"
                  aria-expanded={isMenuOpen}
                >
                  <span className="sr-only">Open menu</span>
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="pt-2 pb-3 space-y-1 border-t border-white/10 dark:border-gray-800/50 rounded-b-2xl backdrop-blur-xl">
              <div className="px-4 py-2">
                <SearchTrigger className="w-full" />
              </div>

              <button
                onClick={() => {
                  setIsAIAssistantOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg mx-2 transition-all"
              >
                <Sparkles className="w-5 h-5 mr-3" />
                AI Assistant
              </button>

              <Link
                href="/"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg mx-2 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Home className="w-5 h-5 mr-3" />
                  Home
                </div>
              </Link>

              <Link
                href="/calendar"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg mx-2 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3" />
                  Calendar
                </div>
              </Link>

              <Link
                href="/flashcards"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg mx-2 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-3" />
                  Flashcards
                </div>
              </Link>

              <Link
                href="/web-saves"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg mx-2 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Bookmark className="w-5 h-5 mr-3" />
                  Web Saves
                </div>
              </Link>

              <button
                onClick={() => {
                  setIsMinimalistTimerOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg mx-2 transition-all"
              >
                <Timer className="w-5 h-5 mr-3" />
                Study Timer
              </button>

              <Link
                href="/groups"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg mx-2 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  Group Chats
                </div>
              </Link>

              <Link
                href="/settings"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg mx-2 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </div>
              </Link>

              <Link
                href="/changelog"
                className="block px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg mx-2 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-3" />
                  Changelog
                </div>
              </Link>

              {user ? (
                <button
                  onClick={() => {
                    setShowLogoutModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50/20 dark:hover:bg-red-900/20 rounded-lg mx-2 transition-all"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              ) : (
                <div className="px-4 py-3 space-y-2 border-t border-white/10 dark:border-gray-800/50 mt-2">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-2.5 text-center text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full px-4 py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all"
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div
            className="rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
                <LogOut className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Sign out?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Are you sure you want to sign out? You'll need to log in again to access your account.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-600/50 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    signOut?.();
                    setShowLogoutModal(false);
                    router.push('/');
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/30"
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