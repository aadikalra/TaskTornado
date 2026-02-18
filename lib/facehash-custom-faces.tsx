/**
 * Custom Facehash eye types — patched into the FACES array at runtime.
 *
 * Each face component follows the same contract as the built-in ones:
 *   Props: { className, style, enableBlink, blinkTimings }
 *   Returns: SVG with two <g> groups (left eye, right eye), fill="currentColor"
 *
 * Import this file once (e.g., in a layout or root component) to register the faces.
 */
'use client';

import React from 'react';
import { FACES } from 'facehash';

// ─── Blink keyframes (reuse the library's approach) ──────────────────────────
const BLINK_KEYFRAMES = `
@keyframes facehash-blink {
  0%, 92%, 100% { transform: scaleY(1); }
  96% { transform: scaleY(0.05); }
}
`;

let keyframesInjected = false;
function injectBlinkKeyframes() {
    if (keyframesInjected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = BLINK_KEYFRAMES;
    document.head.appendChild(style);
    keyframesInjected = true;
}

function getBlinkStyle(timing: { delay: number; duration: number } | undefined) {
    if (!timing) return {};
    return {
        animation: `facehash-blink ${timing.duration}s ease-in-out ${timing.delay}s infinite`,
        transformOrigin: 'center center',
    };
}

interface FaceProps {
    className?: string;
    style?: React.CSSProperties;
    enableBlink?: boolean;
    blinkTimings?: {
        left?: { delay: number; duration: number };
        right?: { delay: number; duration: number };
    };
}

// ─── 1. Diamond Eyes — rotated squares ───────────────────────────────────────
const DiamondFace = ({ className, style, enableBlink, blinkTimings }: FaceProps) => {
    if (enableBlink) injectBlinkKeyframes();
    return (
        <svg aria-hidden="true" className={className} fill="none" style={style} viewBox="0 0 63 15" xmlns="http://www.w3.org/2000/svg">
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.left) : undefined}>
                <rect x="7.2" y="0" width="10" height="10" rx="1.5" fill="currentColor" transform="rotate(45 7.2 5)" />
            </g>
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.right) : undefined}>
                <rect x="55.2" y="0" width="10" height="10" rx="1.5" fill="currentColor" transform="rotate(45 55.2 5)" />
            </g>
        </svg>
    );
};

// ─── 2. Star Eyes — 4-pointed stars ──────────────────────────────────────────
const StarFace = ({ className, style, enableBlink, blinkTimings }: FaceProps) => {
    if (enableBlink) injectBlinkKeyframes();
    // 4-pointed star polygon
    const star = 'M0,-7 L2,-2 L7,0 L2,2 L0,7 L-2,2 L-7,0 L-2,-2 Z';
    return (
        <svg aria-hidden="true" className={className} fill="none" style={style} viewBox="0 0 63 15" xmlns="http://www.w3.org/2000/svg">
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.left) : undefined}>
                <path d={star} fill="currentColor" transform="translate(7.2 7.5)" />
            </g>
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.right) : undefined}>
                <path d={star} fill="currentColor" transform="translate(55.2 7.5)" />
            </g>
        </svg>
    );
};

// ─── 3. Dot Eyes — tiny dots (minimalist) ────────────────────────────────────
const DotFace = ({ className, style, enableBlink, blinkTimings }: FaceProps) => {
    if (enableBlink) injectBlinkKeyframes();
    return (
        <svg aria-hidden="true" className={className} fill="none" style={style} viewBox="0 0 63 15" xmlns="http://www.w3.org/2000/svg">
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.left) : undefined}>
                <circle cx="7.2" cy="7.2" r="3.5" fill="currentColor" />
            </g>
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.right) : undefined}>
                <circle cx="55.2" cy="7.2" r="3.5" fill="currentColor" />
            </g>
        </svg>
    );
};

// ─── 4. Oval Eyes — tall vertical ovals ──────────────────────────────────────
const OvalFace = ({ className, style, enableBlink, blinkTimings }: FaceProps) => {
    if (enableBlink) injectBlinkKeyframes();
    return (
        <svg aria-hidden="true" className={className} fill="none" style={style} viewBox="0 0 63 15" xmlns="http://www.w3.org/2000/svg">
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.left) : undefined}>
                <ellipse cx="7.2" cy="7.2" rx="4" ry="7" fill="currentColor" />
            </g>
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.right) : undefined}>
                <ellipse cx="55.2" cy="7.2" rx="4" ry="7" fill="currentColor" />
            </g>
        </svg>
    );
};

// ─── 5. Square Eyes — rounded squares ────────────────────────────────────────
const SquareFace = ({ className, style, enableBlink, blinkTimings }: FaceProps) => {
    if (enableBlink) injectBlinkKeyframes();
    return (
        <svg aria-hidden="true" className={className} fill="none" style={style} viewBox="0 0 63 15" xmlns="http://www.w3.org/2000/svg">
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.left) : undefined}>
                <rect x="1" y="0.7" width="12.4" height="12.4" rx="2.5" fill="currentColor" />
            </g>
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.right) : undefined}>
                <rect x="49" y="0.7" width="12.4" height="12.4" rx="2.5" fill="currentColor" />
            </g>
        </svg>
    );
};

// ─── 6. Half-Moon Eyes — dreamy semicircles ──────────────────────────────────
const HalfMoonFace = ({ className, style, enableBlink, blinkTimings }: FaceProps) => {
    if (enableBlink) injectBlinkKeyframes();
    return (
        <svg aria-hidden="true" className={className} fill="none" style={style} viewBox="0 0 63 15" xmlns="http://www.w3.org/2000/svg">
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.left) : undefined}>
                <path
                    d="M0 7.2C0 3.22355 3.22355 0 7.2 0C11.1765 0 14.4 3.22355 14.4 7.2H0Z"
                    fill="currentColor"
                />
            </g>
            <g style={enableBlink ? getBlinkStyle(blinkTimings?.right) : undefined}>
                <path
                    d="M48 7.2C48 3.22355 51.2236 0 55.2 0C59.1765 0 62.4 3.22355 62.4 7.2H48Z"
                    fill="currentColor"
                />
            </g>
        </svg>
    );
};

// ─── Register all custom faces ───────────────────────────────────────────────
const CUSTOM_FACES = [DiamondFace, StarFace, DotFace, OvalFace, SquareFace, HalfMoonFace];

let patched = false;
export function patchFacehashFaces() {
    if (patched) return;
    // Cast to mutable — the TS types say readonly but the JS array is mutable at runtime
    CUSTOM_FACES.forEach(face => (FACES as unknown as any[]).push(face));
    patched = true;
}

// Also export for reference
export {
    DiamondFace,
    StarFace,
    DotFace,
    OvalFace,
    SquareFace,
    HalfMoonFace,
    CUSTOM_FACES,
};
