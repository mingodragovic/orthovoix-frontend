// src/hooks/useIsMobile.ts
import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with window width if available
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}