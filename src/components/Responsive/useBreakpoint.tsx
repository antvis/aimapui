import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ResponsiveSchema } from '../../schema/types';

interface ResponsiveContextValue {
  isMobile: boolean;
  breakpoint: number;
  width: number;
  schema: ResponsiveSchema | undefined;
}

const ResponsiveContext = createContext<ResponsiveContextValue>({
  isMobile: false,
  breakpoint: 768,
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  schema: undefined,
});

export interface ResponsiveProviderProps {
  responsive?: ResponsiveSchema;
  children: React.ReactNode;
}

export function ResponsiveProvider({ responsive, children }: ResponsiveProviderProps) {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );

  useEffect(() => {
    let raf: number;
    const handleResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const breakpoint = responsive?.breakpoint ?? 768;
  const isMobile = width < breakpoint;

  const value = useMemo<ResponsiveContextValue>(
    () => ({ isMobile, breakpoint, width, schema: responsive }),
    [isMobile, breakpoint, width, responsive],
  );

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsive(): ResponsiveContextValue {
  return useContext(ResponsiveContext);
}