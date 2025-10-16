import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      {/* Google Fonts - Arvo */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Arvo:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      <section className="relative min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: '"Arvo", serif' }}>
        <div className="container mx-auto px-4 w-full max-w-4xl">
          <div className="flex flex-col items-center text-center">
            {/* 404 Text - Above the animation */}
            <div className="mb-8">
              <h1 className="text-7xl sm:text-8xl font-bold text-gray-800 mb-4" style={{ fontFamily: '"Arvo", serif', fontWeight: 700 }}>
                404
              </h1>
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-semibold" style={{ fontFamily: '"Arvo", serif', fontWeight: 400 }}>
                  Looks like you&apos;re lost
                </h3>
                <p className="text-gray-600" style={{ fontFamily: '"Arvo", serif', fontWeight: 400 }}>
                  The page you are looking for is not available!
                </p>
                <div className="mt-8">
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-[#0052FF] hover:bg-[#0041CC] text-white font-medium rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>

            {/* Animation Area - Below the text */}
            <div
              className="h-96 w-full max-w-4xl bg-center bg-no-repeat rounded-lg"
              style={{
                backgroundImage:
                  "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Minimal custom CSS for the SVG animation */}
      <style>{`
        .btn--tl {
          pointer-events: all;
          cursor: pointer;
          opacity: 1;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: translateZ(0);
        }
        .logo-svg {
          fill: #1a365d;
          transition: all 0.4s ease;
        }
        .logo-path {
          stroke: #1a365d;
          stroke-width: 0;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          transition: all 0.8s ease;
        }
        .btn--tl:hover .logo-path {
          animation: drawLogo 2s ease-in-out forwards;
          stroke-width: 1.5;
        }
        .btn--tl:hover .logo-svg {
          transform: scale(1.1);
          filter: drop-shadow(0 2px 4px rgba(26, 54, 93, 0.3));
        }
        .btn--tl:hover {
          transform: scale(1.05) translateZ(0);
        }
        @keyframes drawLogo {
          0% {
            stroke-dashoffset: 1000;
            fill: transparent;
            stroke: #1a365d;
          }
          50% {
            stroke-dashoffset: 0;
            fill: transparent;
            stroke: #2d3748;
          }
          80% {
            fill: rgba(26, 54, 93, 0.3);
            stroke: #2d3748;
          }
          100% {
            stroke-dashoffset: 0;
            fill: #1a365d;
            stroke: transparent;
          }
        }
        .logo-svg::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background:
            radial-gradient(circle at 30% 20%, rgba(26, 54, 93, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(26, 54, 93, 0.05) 0%, transparent 50%);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        .btn--tl:hover .logo-svg::before {
          opacity: 1;
          animation: inkDrip 0.5s ease-out 1.5s;
        }
        @keyframes inkDrip {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1);
            opacity: 0.1;
          }
        }
        .btn--tl:active {
          transform: scale(0.95) translateZ(0);
          transition: all 0.15s cubic-bezier(0.215, 0.610, 0.355, 1);
        }
      `}</style>
    </>
  );
}