'use client';

import { useState } from 'react';
import Image from 'next/image';

interface RandomHeroImageProps {
  images: string[];
  fallback: string;
}

export default function RandomHeroImage({ images, fallback }: RandomHeroImageProps) {
  const [src] = useState(() => {
    const pool = images.length > 0 ? images : [fallback];
    return pool[Math.floor(Math.random() * pool.length)];
  });
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt="Hero"
      fill
      style={{
        objectFit: 'cover',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
      priority
      onLoad={() => setLoaded(true)}
    />
  );
}
