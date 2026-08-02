'use client';

import React, { useState, useEffect } from "react";
import type { SVGProps } from "react";

type GeometricCatProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  name?: string;
  is100PercentDone?: boolean;
  isNightStudy?: boolean;
  isHeadphones?: boolean;
  isWizard?: boolean;
  isBowtie?: boolean;
  isSunglasses?: boolean;
  isGraduation?: boolean;
};

export default function GeometricCat({
  size = 560,
  name,
  is100PercentDone,
  isNightStudy,
  isHeadphones,
  isWizard,
  isBowtie,
  isSunglasses,
  isGraduation,
  style,
  ...props
}: GeometricCatProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [autoNight, setAutoNight] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setAutoNight(hour >= 22 || hour < 5);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      const timer = setTimeout(() => setIsBlinking(false), 160);
      return () => clearTimeout(timer);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const showCrown = Boolean(is100PercentDone);
  const showGlasses = isNightStudy !== undefined ? isNightStudy : autoNight;

  return (
    <svg
      viewBox="185 -20 760 1114"
      width={size}
      height="auto"
      role="img"
      aria-label="Geometric black and coral cat"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", maxWidth: "100%", ...style }}
      {...props}
    >
      {/* Tail */}
      <path
        fill="#3d608f"
        d="M403 924
           C350 924 295 912 252 886
           C210 860 189 820 189 770
           C189 737 194 705 205 685
           C214 669 229 666 242 671
           C270 681 281 701 277 727
           C273 746 269 761 269 776
           C269 811 283 837 307 853
           C331 870 362 877 393 877
           Z"
      />

      {/* White belly & chest */}
      <path
        fill="#fdfdfd"
        d="M330 569
           C370 574 398 592 416 623
           C431 650 434 688 435 735
           L440 925
           L480 925
           C498 782 523 667 550 584
           C575 509 604 446 636 400
           C581 371 545 357 521 329
           C497 299 486 258 482 208
           L458 208
           C454 247 443 286 418 317
           C396 345 366 359 326 361
           Z"
      />

      {/* Coral rear leg */}
      <path
        fill="#e05545"
        d="M330 569
           C370 574 398 592 416 623
           C431 650 434 688 435 735
           L440 925
           L405 925
           Z"
      />

      {/* Body */}
      <path
        fill="#3d608f"
        d="M636 400
           C604 446 575 509 550 584
           C523 667 498 782 480 925
           L637 925
           C681 923 716 902 738 870
           C762 836 768 789 762 742
           C756 674 727 594 687 515
           C667 475 649 435 636 400
           Z"
      />

      {/* Head */}
      <path
        fill="#3d608f"
        d="M358 76
           C348 113 340 158 334 205
           L333 228
           C329 276 327 320 326 361
           C366 359 396 345 418 317
           C443 286 454 247 458 208
           L482 208
           C486 258 497 299 521 329
           C545 357 581 371 629 376
           C624 342 619 306 616 269
           C614 229 613 190 608 156
           C604 128 598 105 589 89
           C563 107 541 135 522 168
           L424 168
           Z"
      />

      {/* Coral face patch */}
      <path
        fill="#e05545"
        d="M333 206
           L458 208
           C453 246 443 282 424 310
           C404 340 372 358 326 362
           C327 307 329 253 333 206
           Z"
      />

      {/* Eyes */}
      {isBlinking ? (
        <>
          <path
            d="M363 216 Q401 226 440 216"
            fill="none"
            stroke="#3d608f"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M503 218 Q540 228 575 218"
            fill="none"
            stroke="#3d608f"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            fill="#e6bb60"
            d="M363 208
               C371 219 384 225 401 226
               C418 226 431 219 440 208
               Z"
          />
          <path
            fill="#e6bb60"
            d="M503 210
               C512 222 525 229 540 231
               C555 231 567 223 575 212
               Z"
          />
          <ellipse cx="402" cy="211" rx="8" ry="12" fill="#3d608f" />
          <ellipse cx="537" cy="214" rx="8" ry="13" fill="#3d608f" />
        </>
      )}

      {/* White center of the face */}
      <path
        fill="#fdfdfd"
        d="M458 208
           L482 208
           C481 225 481 237 484 247
           C479 246 475 245 470 245
           C469 261 463 276 451 288
           L445 281
           C456 271 463 259 465 248
           C461 247 458 246 455 245
           C457 233 458 220 458 208
           Z"
      />

      {/* Nose and mouth */}
      <path
        fill="#3d608f"
        d="M459 241
           C466 239 477 239 483 242
           C484 244 482 247 479 248
           L463 248
           C459 247 457 244 459 241
           Z"
      />
      <path
        d="M472 247 C472 263 465 277 450 289"
        fill="none"
        stroke="#3d608f"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M472 248 C471 264 476 278 486 282"
        fill="none"
        stroke="#3d608f"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Redesigned Royal Crown (Centered & nestled in forehead dip) */}
      {showCrown && (
        <g id="royal-crown">
          {/* Inner Velvet Cap */}
          <path d="M 433,158 Q 473,121 513,158 Z" fill="#991b1b" />

          {/* Golden Crown Body */}
          <path
            d="M 431,158 L 426,116 L 453,138 L 473,106 L 493,138 L 520,116 L 515,158 Z"
            fill="#fbbf24"
            stroke="#3d608f"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Golden Crown Base Band */}
          <rect x="428" y="154" width="90" height="10" rx="2" fill="#f59e0b" stroke="#3d608f" strokeWidth="3.5" />

          {/* Jewels */}
          <circle cx="426" cy="113" r="5" fill="#ef4444" stroke="#3d608f" strokeWidth="1.5" />
          <circle cx="473" cy="103" r="6" fill="#3b82f6" stroke="#3d608f" strokeWidth="1.5" />
          <circle cx="520" cy="113" r="5" fill="#ef4444" stroke="#3d608f" strokeWidth="1.5" />

          {/* Base Rim Gems */}
          <circle cx="448" cy="159" r="2.5" fill="#ffffff" />
          <circle cx="473" cy="159" r="3" fill="#ef4444" />
          <circle cx="498" cy="159" r="2.5" fill="#ffffff" />
        </g>
      )}

      {/* Round Study Glasses (Night Study after 10 PM) */}
      {showGlasses && !isSunglasses && (
        <g id="study-glasses">
          <circle cx="402" cy="211" r="32" fill="none" stroke="#3d608f" strokeWidth="6" />
          <circle cx="402" cy="211" r="28" fill="#38bdf8" opacity="0.25" />
          <circle cx="537" cy="214" r="32" fill="none" stroke="#3d608f" strokeWidth="6" />
          <circle cx="537" cy="214" r="28" fill="#38bdf8" opacity="0.25" />
          <path d="M434 211 Q470 202 505 214" fill="none" stroke="#3d608f" strokeWidth="6" strokeLinecap="round" />
          <path d="M385 195 L410 190" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d="M520 198 L545 193" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>
      )}

      {/* Cool Sunglasses */}
      {isSunglasses && (
        <g id="cool-sunglasses">
          <path d="M348 194 L452 194 L440 238 L362 238 Z" fill="#18181b" stroke="#3d608f" strokeWidth="5" strokeLinejoin="round" />
          <path d="M508 194 L612 194 L600 238 L522 238 Z" fill="#18181b" stroke="#3d608f" strokeWidth="5" strokeLinejoin="round" />
          <line x1="450" y1="204" x2="510" y2="204" stroke="#18181b" strokeWidth="7" />
          <line x1="362" y1="202" x2="395" y2="228" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
          <line x1="522" y1="202" x2="555" y2="228" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
        </g>
      )}

      {/* Premium Studio Gamer Headphones */}
      {isHeadphones && (
        <g id="gamer-headphones">
          {/* Outer Arch Headband */}
          <path
            d="M 312,175 C 305,25 641,25 634,175"
            fill="none"
            stroke="#18181b"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Cyan Cushion Under-Band */}
          <path
            d="M 322,175 C 317,37 629,37 624,175"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Left Metal Slider Hinge */}
          <rect x="304" y="130" width="16" height="24" rx="4" fill="#64748b" stroke="#3d608f" strokeWidth="3" />

          {/* Right Metal Slider Hinge */}
          <rect x="626" y="130" width="16" height="24" rx="4" fill="#64748b" stroke="#3d608f" strokeWidth="3" />

          {/* Left Studio Ear Cup */}
          <g transform="translate(310, 180) rotate(-14) translate(-310, -180)">
            <rect x="288" y="140" width="44" height="78" rx="20" fill="#18181b" stroke="#3d608f" strokeWidth="5" />
            <rect x="316" y="146" width="12" height="66" rx="6" fill="#3f3f46" />
            <rect x="296" y="152" width="16" height="54" rx="8" fill="none" stroke="#38bdf8" strokeWidth="4" />
            <circle cx="304" cy="179" r="4" fill="#e05545" />
          </g>

          {/* Right Studio Ear Cup */}
          <g transform="translate(636, 180) rotate(14) translate(-636, -180)">
            <rect x="614" y="140" width="44" height="78" rx="20" fill="#18181b" stroke="#3d608f" strokeWidth="5" />
            <rect x="618" y="146" width="12" height="66" rx="6" fill="#3f3f46" />
            <rect x="634" y="152" width="16" height="54" rx="8" fill="none" stroke="#38bdf8" strokeWidth="4" />
            <circle cx="642" cy="179" r="4" fill="#e05545" />
          </g>
        </g>
      )}

      {/* Wizard Hat (Nestled snugly on forehead valley between ears) */}
      {isWizard && (
        <g id="wizard-hat">
          {/* Cone Body */}
          <path
            d="M 425,168 C 438,115 455,60 480,20 C 505,60 522,115 535,168 Z"
            fill="#3730a3"
            stroke="#3d608f"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Crooked Wizard Tip Swirl */}
          <path
            d="M 480,20 Q 465,0 490,5 Q 505,10 495,25"
            fill="#312e81"
            stroke="#3d608f"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Curved Hat Brim */}
          <path
            d="M 405,168 Q 480,185 555,168 Q 480,154 405,168 Z"
            fill="#1e1b4b"
            stroke="#3d608f"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Gold Ribbon Band */}
          <path
            d="M 422,168 Q 480,180 538,168 Q 480,160 422,168 Z"
            fill="#f59e0b"
            stroke="#3d608f"
            strokeWidth="3"
          />

          {/* Gold Stars */}
          <polygon points="480,60 483,67 490,67 484,72 486,79 480,75 474,79 476,72 470,67 477,67" fill="#fbbf24" />
          <polygon points="450,115 452,120 458,120 453,124 455,129 450,126 445,129 447,124 442,120 448,120" fill="#fbbf24" />
          <polygon points="510,110 512,115 518,115 513,119 515,124 510,121 505,124 507,119 502,115 508,115" fill="#fbbf24" />
        </g>
      )}

      {/* Graduation Cap */}
      {isGraduation && (
        <g id="graduation-cap">
          <path d="M420 62 L540 62 L530 92 L430 92 Z" fill="#27272a" stroke="#3d608f" strokeWidth="4" />
          <path d="M480 15 L585 45 L480 75 L375 45 Z" fill="#18181b" stroke="#3d608f" strokeWidth="5" strokeLinejoin="round" />
          <circle cx="480" cy="45" r="5" fill="#fbbf24" />
          <path d="M480 45 L565 70 L565 105" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
          <circle cx="565" cy="108" r="4" fill="#f59e0b" />
        </g>
      )}

      {/* Cute Bowtie */}
      {isBowtie && (
        <g id="cute-bowtie">
          <path d="M435 370 L480 382 L435 394 Z" fill="#e05545" stroke="#3d608f" strokeWidth="4" strokeLinejoin="round" />
          <path d="M525 370 L480 382 L525 394 Z" fill="#e05545" stroke="#3d608f" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="480" cy="382" r="8" fill="#b91c1c" stroke="#3d608f" strokeWidth="3" />
        </g>
      )}

      {/* Large Standalone Coffee Cup to the Right (Only for Night Study / Scholar Cat) */}
      {showGlasses && (
        <g id="large-coffee-cup">
          <defs>
            <linearGradient id="steam-gradient-1" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#cbd5e1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="steam-gradient-2" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#94a3b8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Clean Static Vector Steam Wisps */}
          <g>
            <path
              d="M 748,705 C 730,665 765,625 738,575 C 720,535 745,500 735,470"
              fill="none"
              stroke="url(#steam-gradient-1)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 777,698 C 798,655 758,610 782,555 C 800,510 775,475 785,445"
              fill="none"
              stroke="url(#steam-gradient-2)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 806,705 C 825,670 792,630 816,585 C 832,545 810,510 820,480"
              fill="none"
              stroke="url(#steam-gradient-1)"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>

          {/* Mug Handle */}
          <path
            d="M840 740 C890 740 890 870 840 870"
            fill="none"
            stroke="#3d608f"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Mug Shadow */}
          <ellipse cx="780" cy="925" rx="65" ry="12" fill="#3d608f" opacity="0.15" />

          {/* Mug Body */}
          <rect x="720" y="710" width="115" height="190" rx="20" fill="#e05545" stroke="#3d608f" strokeWidth="8" />

          {/* Coffee Rim / Top Rim */}
          <ellipse cx="777" cy="715" rx="55" ry="16" fill="#582c12" stroke="#3d608f" strokeWidth="7" />
          <ellipse cx="770" cy="715" rx="36" ry="9" fill="#854d0e" opacity="0.7" />

          {/* Cute Heart Emblem on Front of Mug */}
          <path
            d="M766 790 C756 778 742 784 742 796 C742 810 777 828 777 828 C777 828 812 810 812 796 C812 784 798 778 788 790 C780 798 774 798 766 790 Z"
            fill="#ffffff"
          />
        </g>
      )}

      {/* Left whiskers */}
      <g
        fill="none"
        stroke="#3d608f"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <path d="M264 264 C308 262 352 261 400 264" />
        <path d="M235 319 C282 287 336 271 400 264" />
        <path d="M287 326 C320 297 357 278 400 265" />
      </g>

      {/* Right whiskers */}
      <g
        fill="none"
        stroke="#3d608f"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <path d="M616 264 C638 264 656 265 676 267" />
        <path d="M615 279 C646 288 676 302 704 321" />
        <path d="M614 290 C632 302 646 315 654 329" />
      </g>
    </svg>
  );
}

export const PixelCat = GeometricCat;