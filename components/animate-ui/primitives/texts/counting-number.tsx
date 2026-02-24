'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform, type SpringOptions } from 'motion/react';

import { useIsInView, type UseIsInViewOptions } from '@/hooks/use-is-in-view';

interface CountingNumberProps extends React.ComponentProps<typeof motion.span>, UseIsInViewOptions {
    number: number;
    fromNumber?: number;
    padStart?: boolean;
    decimalSeparator?: string;
    decimalPlaces?: number;
    transition?: SpringOptions;
    initiallyStable?: boolean;
    delay?: number;
}

export const CountingNumber = React.forwardRef<HTMLSpanElement, CountingNumberProps>(
    (
        {
            number,
            fromNumber = 0,
            padStart = false,
            decimalSeparator = '.',
            decimalPlaces = 0,
            transition = { stiffness: 90, damping: 50 },
            initiallyStable = false,
            inView = true,
            inViewMargin = '0px',
            inViewOnce = true,
            delay = 0,
            className,
            ...props
        },
        ref,
    ) => {
        const { ref: localRef, isInView } = useIsInView<HTMLSpanElement>(ref, {
            inView,
            inViewOnce,
            inViewMargin,
        });

        const count = useMotionValue(initiallyStable ? number : fromNumber);
        const springCount = useSpring(count, transition);

        const display = useTransform(springCount, (latest) => {
            const val = latest.toFixed(decimalPlaces);
            const [integer, fraction] = val.split('.');
            const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            if (fraction) {
                return `${formattedInteger}${decimalSeparator}${fraction}`;
            }
            return formattedInteger;
        });

        React.useEffect(() => {
            if (isInView) {
                const timeout = setTimeout(() => {
                    count.set(number);
                }, delay);
                return () => clearTimeout(timeout);
            }
        }, [count, number, isInView, delay]);

        return (
            <motion.span ref={localRef} className={className} {...props}>
                {display}
            </motion.span>
        );
    }
);

CountingNumber.displayName = 'CountingNumber';
