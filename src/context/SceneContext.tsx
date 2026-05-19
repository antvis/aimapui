import React, { createContext, useContext, useRef } from 'react';
import type { Scene } from '@antv/l7';

const SceneContext = createContext<Scene | null>(null);

export interface SceneProviderProps {
  scene: Scene | null;
  children: React.ReactNode;
}

export function SceneProvider({ scene, children }: SceneProviderProps) {
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  return (
    <SceneContext.Provider value={sceneRef.current}>
      {children}
    </SceneContext.Provider>
  );
}

export function useScene(): Scene | null {
  return useContext(SceneContext);
}

export { SceneContext };