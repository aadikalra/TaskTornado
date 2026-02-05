import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      {/* Google Fonts - Arvo */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Arvo:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      <section className="relative min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors duration-300" style={{ fontFamily: '"Arvo", serif' }}>
        <div className="container mx-auto px-4 w-full max-w-4xl">
          <div className="flex flex-col items-center text-center">
            {/* 404 Text - Above the animation */}
            <div className="mb-8">
              <h1 className="text-7xl sm:text-8xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors" style={{ fontFamily: '"Arvo", serif', fontWeight: 700 }}>
                404
              </h1>
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-200 transition-colors" style={{ fontFamily: '"Arvo", serif', fontWeight: 400 }}>
                  Looks like you&apos;re lost
                </h3>
                <p className="text-gray-600 dark:text-gray-400 transition-colors" style={{ fontFamily: '"Arvo", serif', fontWeight: 400 }}>
                  The page you are looking for is not available!
                </p>
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
        :root {
          --logo-fill: #1a365d;
          --logo-stroke: #1a365d;
          --logo-stroke-mid: #2d3748;
          --logo-glow: rgba(26, 54, 93, 0.3);
          --logo-radial-1: rgba(26, 54, 93, 0.1);
          --logo-radial-2: rgba(26, 54, 93, 0.05);
        }
        
        @media (prefers-color-scheme: dark) {
          :root {
            --logo-fill: #90cdf4;
            --logo-stroke: #63b3ed;
            --logo-stroke-mid: #bee3f8;
            --logo-glow: rgba(144, 205, 244, 0.4);
            --logo-radial-1: rgba(144, 205, 244, 0.15);
            --logo-radial-2: rgba(144, 205, 244, 0.08);
          }
        }
        
        .dark {
          --logo-fill: #90cdf4;
          --logo-stroke: #63b3ed;
          --logo-stroke-mid: #bee3f8;
          --logo-glow: rgba(144, 205, 244, 0.4);
          --logo-radial-1: rgba(144, 205, 244, 0.15);
          --logo-radial-2: rgba(144, 205, 244, 0.08);
        }
        
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
          fill: var(--logo-fill);
          transition: all 0.4s ease;
        }
        .logo-path {
          stroke: var(--logo-stroke);
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
          filter: drop-shadow(0 2px 4px var(--logo-glow));
        }
        .btn--tl:hover {
          transform: scale(1.05) translateZ(0);
        }
        @keyframes drawLogo {
          0% {
            stroke-dashoffset: 1000;
            fill: transparent;
            stroke: var(--logo-stroke);
          }
          50% {
            stroke-dashoffset: 0;
            fill: transparent;
            stroke: var(--logo-stroke-mid);
          }
          80% {
            fill: var(--logo-radial-1);
            stroke: var(--logo-stroke-mid);
          }
          100% {
            stroke-dashoffset: 0;
            fill: var(--logo-fill);
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
            radial-gradient(circle at 30% 20%, var(--logo-radial-1) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, var(--logo-radial-2) 0%, transparent 50%);
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