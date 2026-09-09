'use client';

import React from 'react';

interface TextRevealProps {
  text: string;
  inline?: boolean;
  time?: string | number;
  color?: string;
}

/**
 * Rainbow gradient text reveal ported from the Draft Mode / pixelPallete
 * project. Use `inline` for headings and other text that should remain in
 * the document flow:
 *
 *   <TextReveal text="Heading" inline />
 */
export default function TextReveal({
  text,
  inline = false,
  time = '2s',
  color = '#0f172a',
}: TextRevealProps) {
  const duration = typeof time === 'number' ? `${time}s` : time;

  if (inline) {
    return (
      <>
        <style>{`
          @keyframes reveal-inline {
            0% {
              opacity: 0;
              background-position: 100% 0;
              filter: blur(6px);
            }
            15% {
              opacity: 1;
              filter: blur(0px);
            }
            60% {
              background-position: 0% 0;
              opacity: 1;
            }
            100% {
              opacity: 1;
              background-position: 0% 0;
            }
          }

          .reveal-inline-anim {
            background-image: linear-gradient(to right, ${color} 0%, ${color} 35%, #1a64f3 42%, #c4caf2 46%, #e8b146 49%, #fc6a16 51%, #ce5872 52.5%, #c87dc7 53.5%, #e6d0e4 54%, transparent 56%, transparent 100%);
            background-size: 300% 100%;
            animation: reveal-inline ${duration} cubic-bezier(0.95, 0, 0.05, 1) forwards;
          }

          .dark .reveal-inline-anim {
            background-image: linear-gradient(to right, ${color} 0%, ${color} 35%, #38bdf8 42%, #c4caf2 46%, #e8b146 49%, #fc6a16 51%, #ce5872 52.5%, #c87dc7 53.5%, #e6d0e4 54%, transparent 56%, transparent 100%);
          }

          @media (prefers-color-scheme: dark) {
            .reveal-inline-anim {
              background-image: linear-gradient(to right, ${color} 0%, ${color} 35%, #38bdf8 42%, #c4caf2 46%, #e8b146 49%, #fc6a16 51%, #ce5872 52.5%, #c87dc7 53.5%, #e6d0e4 54%, transparent 56%, transparent 100%);
            }
          }
        `}</style>
        <span className="inline-block bg-clip-text text-transparent bg-[100%_0] reveal-inline-anim">
          {text}
        </span>
      </>
    );
  }

  const gradientClass =
    `bg-[linear-gradient(to_right,${color}_0%,${color}_35%,#1a64f3_42%,#c4caf2_46%,#e8b146_49%,#fc6a16_51%,#ce5872_52.5%,#c87dc7_53.5%,#e6d0e4_54%,transparent_56%,transparent_100%)]`;

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f8f9fa] overflow-hidden font-sans m-0">
      <style>{`
        @keyframes reveal {
          0% {
            opacity: 0;
            background-position: 100% 0;
            filter: blur(8px);
          }
          10% {
            opacity: 1;
            filter: blur(0px);
          }
          55% {
            background-position: 0% 0;
            opacity: 1;
          }
          85% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.02);
            background-position: 0% 0;
          }
        }

        .custom-reveal-animation {
          transform: translate(-50%, -50%);
          animation: reveal ${duration} cubic-bezier(0.95, 0, 0.05, 1) forwards;
        }
      `}</style>

      <div className="relative text-[6rem] font-medium tracking-[-0.04em]">
        <div
          className={`
            absolute top-1/2 left-1/2 opacity-0
            ${gradientClass}
            bg-[length:300%_100%] bg-clip-text text-transparent
            custom-reveal-animation
          `}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
