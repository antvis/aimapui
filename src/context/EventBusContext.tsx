import React, { createContext, useContext, useRef, useEffect } from 'react';
import { EventBus, createEventBus } from '../core/event-bus';

const EventBusContext = createContext<EventBus | null>(null);

export interface EventBusProviderProps {
  /** 初始事件监听（从 Aimap events prop 传入） */
  events?: Record<string, (...args: unknown[]) => void>;
  children: React.ReactNode;
}

export function EventBusProvider({ events, children }: EventBusProviderProps) {
  const busRef = useRef<EventBus | null>(null);
  if (!busRef.current) {
    busRef.current = createEventBus();
  }

  // 注册/更新事件监听
  useEffect(() => {
    if (!events || !busRef.current) return;
    const bus = busRef.current;
    const offFns: (() => void)[] = [];

    for (const [name, handler] of Object.entries(events)) {
      if (handler) {
        offFns.push(bus.on(name, handler));
      }
    }

    return () => {
      offFns.forEach((off) => off());
    };
  }, [events]);

  return (
    <EventBusContext.Provider value={busRef.current}>
      {children}
    </EventBusContext.Provider>
  );
}

export function useEventBus(): EventBus {
  const bus = useContext(EventBusContext);
  if (!bus) {
    throw new Error('[AimapKit] useEventBus must be used within an EventBusProvider');
  }
  return bus;
}

export { EventBusContext };