"use client";

import React, { useState } from 'react';

export default function LetterComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap');

        @keyframes flyIn {
          0% { transform: translateY(100vh) rotate(10deg) scale(0.8); opacity: 0; }
          60% { transform: translateY(-20px) rotate(-2deg) scale(1.02); opacity: 1; }
          80% { transform: translateY(10px) rotate(1deg) scale(0.99); }
          100% { transform: translateY(0) rotate(0) scale(1); opacity: 1; }
        }

        .envelope-container {
          animation: flyIn 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }

        .flap-left {
          border-width: 225px 0 225px 300px;
          border-color: transparent transparent transparent #d6c9ad;
        }
        .flap-right {
          border-width: 225px 300px 225px 0;
          border-color: transparent #d6c9ad transparent transparent;
        }
        .flap-bottom {
          border-width: 0 300px 240px 300px;
          border-color: transparent transparent #e9ddc6 transparent;
        }
        .flap-top {
          border-width: 240px 300px 0 300px;
          border-color: #f2e8d5 transparent transparent transparent;
          transform-origin: top;
          transition: transform 0.4s 0.2s ease-in-out, z-index 0.2s 0.2s;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.06));
        }
        .flap-top.open {
          transform: rotateX(180deg);
          z-index: 1;
          transition-delay: 0s;
        }

        .letter { transition: transform 0.5s ease-in-out; }
        .letter.open {
          transform: translate(-50%, -200px);
          z-index: 6;
          transition: transform 0.6s 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), z-index 0s 0.4s;
        }

        .seal { transition: transform 0.4s ease, opacity 0.3s ease; }
        .seal.open { opacity: 0; transform: translate(-50%, -50%) scale(0.5); pointer-events: none; }

        .hint { transition: opacity 0.5s ease, transform 0.5s ease; }
        .envelope-container:hover .hint { opacity: 1; transform: translateY(0); }

        .envelope-wrapper {
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
        }
        .envelope-container:hover .envelope-wrapper {
          transform: translateY(-6px) scale(1.015);
          box-shadow:
            0 30px 60px rgba(120, 100, 60, 0.12),
            0 10px 20px rgba(120, 100, 60, 0.08);
        }

        .letter-body::-webkit-scrollbar { width: 4px; }
        .letter-body::-webkit-scrollbar-thumb { background-color: #ddd; border-radius: 4px; }
      `}</style>

      <div
        className="min-h-screen w-full flex justify-center items-center overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #f5f1eb 0%, #e9e3da 50%, #f0ebe3 100%)',
          fontFamily: "'Inter', sans-serif",
          perspective: '1000px',
        }}
      >
        <div className="envelope-container relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div
            className="envelope-wrapper relative"
            style={{
              width: '600px',
              height: '450px',
              boxShadow:
                '0 15px 40px rgba(120, 100, 60, 0.1), 0 5px 15px rgba(120, 100, 60, 0.06)',
              borderRadius: '4px',
            }}
          >
            {/* Inner liner – dark navy visible when open */}
            <div
              className="absolute bottom-0 left-0 w-full h-full"
              style={{
                background: 'linear-gradient(175deg, #1b2838 0%, #2c3e50 60%, #34495e 100%)',
                zIndex: 1,
                borderRadius: '4px',
              }}
            />
            {/* Subtle diagonal stripe pattern on liner */}
            <div
              className="absolute bottom-0 left-0 w-full h-full"
              style={{
                zIndex: 1,
                borderRadius: '4px',
                opacity: 0.06,
                backgroundImage:
                  'repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 9px)',
              }}
            />

            {/* Top flap */}
            <div
              className={`flap-top absolute top-0 left-0 border-solid ${isOpen ? 'open' : ''}`}
              style={{ width: 0, height: 0, zIndex: isOpen ? 1 : 5 }}
            />

            {/* Wax seal */}
            <div
              className={`seal absolute flex items-center justify-center rounded-full ${isOpen ? 'open' : ''}`}
              style={{
                top: '240px',
                left: '50%',
                transform: isOpen ? 'translate(-50%, -50%) scale(0.5)' : 'translate(-50%, -50%)',
                width: '56px',
                height: '56px',
                background: 'radial-gradient(circle at 38% 35%, #e25750 0%, #c0392b 45%, #922b21 100%)',
                zIndex: 6,
                boxShadow:
                  '0 4px 12px rgba(146, 43, 33, 0.4), inset 0 1px 3px rgba(255,255,255,0.15), inset 0 -1px 3px rgba(0,0,0,0.15)',
                fontFamily: "'Playfair Display', serif",
                fontWeight: '600',
                color: '#fde8e0',
                fontSize: '1.4rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.25)',
              }}
            >
              <img
                src="/TaskTornadoDark.svg"
                alt="TaskTornado"
                style={{
                  width: '28px',
                  height: '28px',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: '46px',
                  height: '46px',
                  border: '1.5px solid rgba(255,255,255,0.12)',
                }}
              />
              {/* Wax seal scalloped edge bumps */}
              {[...Array(14)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: '7px',
                    height: '7px',
                    background:
                      'radial-gradient(circle at 40% 35%, #d44637, #a93226)',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * (360 / 14)}deg) translateY(-26px)`,
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>

            {/* Letter */}
            <div
              className={`letter absolute flex flex-col gap-4 overflow-hidden ${isOpen ? 'open' : ''}`}
              style={{
                bottom: 0,
                left: '50%',
                transform: isOpen ? 'translate(-50%, -200px)' : 'translateX(-50%)',
                width: '550px',
                height: '420px',
                backgroundColor: '#fefcf7',
                zIndex: isOpen ? 6 : 2,
                padding: '35px 40px',
                boxShadow: isOpen
                  ? '0 25px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)'
                  : '0 -3px 8px rgba(0,0,0,0.04)',
                borderRadius: '3px',
              }}
            >
              {/* Subtle top accent stripe */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #c0392b, #e67e22, #f1c40f, #e67e22, #c0392b)',
                  borderRadius: '3px 3px 0 0',
                }}
              />

              <div
                className="flex justify-between items-center pb-4 mb-1"
                style={{ borderBottom: '1px solid #e8e0d4' }}
              >
                <span
                  className="font-semibold italic"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: '#2c3e50',
                    fontSize: '1.2rem',
                  }}
                >
                  Welcome to TaskTornado
                </span>
                <span
                  className="text-xs uppercase"
                  style={{ color: '#b5a998', letterSpacing: '0.12em' }}
                >
                  Today
                </span>
              </div>

              <div
                className="letter-body leading-relaxed overflow-y-auto pr-1"
                style={{ fontSize: '0.95rem', color: '#4a4540' }}
              >
                <p>Hey there!</p>
                <p className="mt-2">
                  Welcome to TaskTornado! We're absolutely thrilled to have you join our community of
                  students who are taking control of their academic journey.
                </p>
                <p className="mt-3">
                  TaskTornado was built with one simple goal: to help you stay organized, reduce stress,
                  and focus on what really matters — your learning. Whether you're managing homework,
                  tracking tests, or collaborating with study groups, we've got you covered.
                </p>
                <p className="mt-3">
                  We believe every student deserves tools that just work. No complicated setups, no
                  overwhelming features — just a clean, intuitive space to help you succeed.
                </p>
                <p className="mt-3">
                  Thank you for choosing us to be part of your academic adventure. We're honored to
                  support you on this journey!
                </p>
                <p className="mt-3">Here's to a productive and successful year ahead!</p>
              </div>

              <div
                className="mt-auto text-right font-bold pt-2"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  color: '#27ae60',
                  fontSize: '1.3rem',
                }}
              >
                The TaskTornado Team
              </div>
            </div>

            <div className="flap-left absolute top-0 left-0 border-solid" style={{ width: 0, height: 0, zIndex: 3 }} />
            <div className="flap-right absolute top-0 right-0 border-solid" style={{ width: 0, height: 0, zIndex: 3 }} />
            <div className="flap-bottom absolute bottom-0 left-0 border-solid" style={{ width: 0, height: 0, zIndex: 4 }} />

            {/* Subtle fold highlight at the bottom flap's top edge */}
            <div
              className="absolute"
              style={{
                bottom: '210px',
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.2) 50%, transparent 95%)',
                zIndex: 5,
              }}
            />
          </div>

          <div
            className="hint absolute w-full text-center opacity-0"
            style={{
              bottom: '-55px',
              fontSize: '0.8rem',
              transform: 'translateY(-10px)',
              color: '#b0a593',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 300,
            }}
          >
            Click to open
          </div>
        </div>
      </div>
    </>
  );
}