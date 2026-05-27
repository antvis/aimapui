import React, { createContext, useContext } from 'react';
import type { AiMapSchema } from '../schema/types';

const SchemaContext = createContext<AiMapSchema | null>(null);

export interface SchemaProviderProps {
  schema: AiMapSchema;
  children: React.ReactNode;
}

export function SchemaProvider({ schema, children }: SchemaProviderProps) {
  return (
    <SchemaContext.Provider value={schema}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema(): AiMapSchema | null {
  return useContext(SchemaContext);
}

export { SchemaContext };