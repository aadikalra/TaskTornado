'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function NotFoundBackdrop({ dark }: { dark?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Image
      src={dark ? '/404_Page_Dark.png' : '/404_Page.png'}
      alt="404 Page Not Found"
      fill
      sizes="100vw"
      className="object-cover"
    />
  );
}
