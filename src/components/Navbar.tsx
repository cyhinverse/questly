"use client";

import { Button } from "@/components/Button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname(); // luôn gọi hook trước!

  // Helper functions - define before using
  const getNavbarClasses = () => {
    // Always return same base classes to prevent hydration mismatch
    return "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 navbar-adaptive rounded-2xl shadow-lg border border-gray-200/30 backdrop-blur-2xl bg-white/80";
  };

  const getTextClasses = () => {
    // Always return same classes to prevent hydration mismatch
    return "text-gray-800 hover:text-black";
  };

  const getMenuItemClasses = () => {
    // Modern menu item styling for black & white theme - smaller padding
    return "text-gray-800 hover:text-black transition-all duration-200 font-sans font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-gray-300";
  };

  const getButtonClasses = () => {
    // Modern button styling for black & white theme - smaller padding
    return "bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 text-white font-sans font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105";
  };

  useEffect(() => {
    setIsMounted(true);
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Determine navbar style based on current page - only after mount to prevent hydration mismatch
  const isHomePage = isMounted && pathname === "/";
  const isGrayPage = isMounted && (pathname.startsWith("/profile") || pathname.startsWith("/quiz"));
  
  // Debug log to check if logic is working
  useEffect(() => {
  }, [pathname, isHomePage, isGrayPage, isMounted]);

  // Update data attribute after mount to trigger style changes
  useEffect(() => {
    if (isMounted) {
      const navbar = document.querySelector('.navbar-adaptive');
      if (navbar) {
        const pageType = isHomePage ? "home" : isGrayPage ? "gray" : "default";
        navbar.setAttribute('data-page-type', pageType);
      }
    }
  }, [isMounted, isHomePage, isGrayPage]);

  // Sau khi gọi tất cả hooks, mới kiểm tra và return null
  if (pathname.startsWith("/auth")) return null;

  return (
    <nav 
      className={`${getNavbarClasses()}`}
      data-page-type="default"
    >
      <div className="px-6 py-2">
        <div className="flex justify-center items-center min-h-10">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <>
                <Link href="/quiz" className={getMenuItemClasses()}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Quizzes
                  </div>
                </Link>
                <Link href="/room/lobby" className={getMenuItemClasses()}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Join Room
                  </div>
                </Link>
                <Link href="/profile" className={getMenuItemClasses()}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </div>
                </Link>
              </>
            )}
            {!user && (
              <a href="/auth/login">
                <button className={getButtonClasses()}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Start Playing
                  </div>
                </button>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800 hover:text-black transition-all duration-200 font-medium p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden pb-3 mt-3 pt-3 rounded-b-2xl ${isMounted && isHomePage ? 'border-t border-gray-300' : 'border-t border-gray-200'}`}>
            <div className="flex flex-col gap-3">
              {user && (
                <>
                  <Link 
                    href="/quiz" 
                    className={`${getMenuItemClasses()} w-full text-center`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Quizzes
                    </div>
                  </Link>
                  <Link 
                    href="/room/lobby" 
                    className={`${getMenuItemClasses()} w-full text-center`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Join Room
                    </div>
                  </Link>
                  <Link 
                    href="/profile" 
                    className={`${getMenuItemClasses()} w-full text-center`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </div>
                  </Link>
                </>
              )}
              {!user && (
                <a href="/auth/login">
                  <button className={`${getButtonClasses()} w-full`}>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Start Playing
                    </div>
                  </button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
