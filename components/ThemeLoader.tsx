'use client';

import { useEffect } from 'react';

interface ThemeLoaderProps {
  branding: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export default function ThemeLoader({ branding }: ThemeLoaderProps) {
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', branding.primaryColor);
    root.style.setProperty('--secondary-color', branding.secondaryColor);
    root.style.setProperty('--font-family', branding.fontFamily);
  }, [branding]);

  return null;
}
