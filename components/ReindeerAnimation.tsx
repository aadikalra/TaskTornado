
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const ReindeerAnimation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none">
      <motion.div
        initial={{ x: '100vw' }}
        animate={{
          x: '-96px',
          y: [0, -20, 0, -20, 0]
        }}
        transition={{
          x: {
            duration: 30,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear'
          },
          y: {
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }
        }}
        className="absolute bottom-0"
      >
        <Image
          src="/reindeer.png"
          alt="Reindeer"
          width={96} // Equivalent to w-24 (96px)
          height={96} // Equivalent to h-24 (96px)
          className="w-24 h-24 object-contain"
        />
      </motion.div>
    </div>
  );
};
