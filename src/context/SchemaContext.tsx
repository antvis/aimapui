import React, { createContext, useContext } from 'react';
import type { AimapSchema } from '../schema/types';

const SchemaContext = createContext<AimapSchema | null>(null);

export interface SchemaProviderProps {
  schema: AimapSchema;
  children: React.ReactNode;
}

export function SchemaProvider({ schema, children }: SchemaProviderProps) {
  return (
    <SchemaContext.Provider value={schema}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema(): AimapSchema | null {
  return useContext(SchemaContext);
}

export { SchemaContext };