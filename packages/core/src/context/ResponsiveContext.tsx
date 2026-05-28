import React, { createContext, useContext, useMemo } from 'react';
import type { ResponsiveSchema } from '../schema/types';

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
  // 使用 ahooks 的 useResponsive 或手动监听
  const [width, setWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

export { ResponsiveContext };