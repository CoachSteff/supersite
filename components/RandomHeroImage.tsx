'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface RandomHeroImageProps {
  images: string[];
  fallback: string;
  alt?: string;
}

export default function RandomHeroImage({ images, fallback, alt }: RandomHeroImageProps) {
  const pool = images.length > 0 ? images : [fallback];
  const [src, setSrc] = useState(pool[0]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (pool.length > 1) {
      setSrc(pool[Math.floor(Math.random() * pool.length)]);
    }
    // pool is derived from props; re-running on prop change is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, fallback]);

  return (
    <Image
      src={src}
      alt={alt || ''}
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
