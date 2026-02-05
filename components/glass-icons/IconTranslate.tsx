import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: string;
}

function IconTranslate({ size = '24px', className = '', ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <defs>
                {/* Unified Glass Gradient - Clean White/Gray Blend */}
                <linearGradient id="translateGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
                </linearGradient>

                {/* Vertical Shine for depth */}
                <linearGradient id="translateReflect" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                </linearGradient>
            </defs>

            {/* Main Container - Super Squircle */}
            <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                fill="url(#translateGlassGrad)"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="0.5"
            />

            {/* Top Shine Layer */}
            <rect
                x="2.5"
                y="2.5"
                width="19"
                height="9"
                rx="4.5"
                fill="url(#translateReflect)"
                opacity="0.4"
            />

            {/* The "文" (Wen) Character - Centered in Platform Blue */}
            {/* Adjusted position to be perfectly visually centered in the 20x20 box */}
            <g transform="translate(4, 4)" stroke="#165df9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3V6" /> {/* Vertical Top */}
                <path d="M2.5 6H13.5" /> {/* Horizontal Arm */}
                <path d="M8 6C8 6 6.5 11 2.5 14" /> {/* Left Leg */}
                <path d="M8 6C8 10 10.5 13 13.5 14" /> {/* Right Leg */}
            </g>
        </svg>
    );
}

export default IconTranslate;
