import { useId } from 'react';
import styles from './Hero.module.css';

const lowerCrest = 'M0 229 C140 145 320 91 478 97 C740 93 1011 205 1236 213 C1419 220 1604 156 1734 67';

export default function HeroWaves() {
    const id = useId();

    return (
        <div aria-hidden="true" className={styles.waves}>
            <svg className={styles.upperWaves} viewBox="0 0 1734 381" preserveAspectRatio="none" focusable="false">
                <defs>
                    <linearGradient id={`${id}-upper-wash`} x1="0" y1="310" x2="892" y2="-6" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--wave-upper-base, #e1f2d4)" />
                        <stop offset=".25" stopColor="var(--wave-upper-mist, #cde6df)" />
                        <stop offset=".58" stopColor="var(--wave-upper-fade, #daece5)" />
                        <stop offset="1" stopColor="var(--wave-upper-fade, #e9f4e9)" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id={`${id}-upper-glow`} cx="0" cy="0" r="1" gradientTransform="translate(0 140) scale(340 246)" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--wave-upper-glow, #4d9ce2)" />
                        <stop offset=".48" stopColor="var(--wave-upper-glow-mid, #91c8e6)" />
                        <stop offset=".78" stopColor="var(--wave-upper-glow-fade, #badce7)" stopOpacity=".7" />
                        <stop offset="1" stopColor="var(--wave-upper-glow-fade, #badce7)" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id={`${id}-upper-blue`} x1="0" y1="118" x2="171" y2="174" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--wave-ribbon-blue, #227fdb)" />
                        <stop offset="1" stopColor="var(--wave-ribbon-fade, #83bfec)" />
                    </linearGradient>
                    <linearGradient id={`${id}-upper-navy`} x2="130" y2="105" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--wave-navy, #0e54a2)" />
                        <stop offset="1" stopColor="var(--wave-navy-fade, #0d5aad)" />
                    </linearGradient>
                    <path id={`${id}-upper-shape`} d="M0 381 C141 251 398 131 629 104 C774 85 901 41 984 0 H0 Z" />
                </defs>
                <use href={`#${id}-upper-shape`} fill={`url(#${id}-upper-wash)`} />
                <use href={`#${id}-upper-shape`} fill={`url(#${id}-upper-glow)`} />
                <g className={styles.upperRibbons}>
                    <path d="M0 229 C81 144 148 51 221 0 H0 Z" fill={`url(#${id}-upper-blue)`} />
                    <path d="M0 106 C62 74 121 40 167 0 H0 Z" fill={`url(#${id}-upper-navy)`} />
                </g>
                <path className={styles.waveEdge} d="M-3 259 C167 140 399 141 646 -2" />
            </svg>

            <svg className={styles.lowerWaves} viewBox="0 0 1734 229" preserveAspectRatio="none" focusable="false">
                <defs>
                    <linearGradient id={`${id}-lower-wash`} x1="1470" y1="36" x2="1513" y2="205" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--wave-lower-mist, #c9e6dd)" />
                        <stop offset=".53" stopColor="var(--wave-lower-mist-mid, #acd8e8)" />
                        <stop offset="1" stopColor="var(--wave-lower-mist-blue, #5ca9e6)" />
                    </linearGradient>
                    <linearGradient id={`${id}-lower-blue`} x1="0" y1="183" x2="1485" y2="275" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--wave-lower-base, #f0f7e9)" />
                        <stop offset=".17" stopColor="var(--wave-upper-fade, #d6ebe4)" />
                        <stop offset=".38" stopColor="var(--wave-upper-glow-fade, #97cfe9)" />
                        <stop offset=".63" stopColor="var(--wave-ribbon-fade, #60abe6)" />
                        <stop offset=".78" stopColor="var(--wave-ribbon-blue, #2c88df)" />
                        <stop offset="1" stopColor="var(--wave-lower-mist-blue, #57a9e8)" />
                    </linearGradient>
                    <linearGradient id={`${id}-lower-swell`} x1="493" y1="158" x2="1200" y2="261" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--wave-ribbon-fade, #78bde9)" />
                        <stop offset=".55" stopColor="var(--wave-ribbon-blue, #318edf)" />
                        <stop offset=".86" stopColor="var(--wave-lower-swell, #1773ce)" />
                        <stop offset="1" stopColor="var(--wave-lower-swell, #1773ce)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id={`${id}-lower-navy`} x1="1415" y1="229" x2="1734" y2="165" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--wave-navy-fade, #1061af)" />
                        <stop offset="1" stopColor="var(--wave-navy, #0e55a0)" />
                    </linearGradient>
                    <path id={`${id}-lower-shape`} d={`${lowerCrest} V230 H0 Z`} />
                    <clipPath id={`${id}-lower-clip`}>
                        <use href={`#${id}-lower-shape`} />
                    </clipPath>
                </defs>
                <path d="M877 230 C966 196 1035 195 1098 193 C1365 185 1599 112 1734 0 V230 Z" fill={`url(#${id}-lower-wash)`} />
                <use href={`#${id}-lower-shape`} fill={`url(#${id}-lower-blue)`} />
                <g clipPath={`url(#${id}-lower-clip)`}>
                    <path d="M489 230 C740 136 881 174 1087 196 C1212 209 1299 219 1388 230 Z" fill={`url(#${id}-lower-swell)`} />
                    <path d="M1415 230 C1514 202 1639 160 1734 124 V230 Z" fill={`url(#${id}-lower-navy)`} />
                </g>
                <path className={styles.waveEdge} d={lowerCrest} />
            </svg>
        </div>
    );
}
