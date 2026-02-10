'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}

export default function Avatar({ src, name = 'User', size = 40, className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Show profile picture if available and loads successfully
  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
        onError={() => setImageError(true)}
      />
    );
  }

  // Default: Show User icon in gray circle
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'var(--border-color)',
        color: 'var(--text-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      aria-label={name}
    >
      <User size={size * 0.5} />
    </div>
  );
}
