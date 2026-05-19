type EventCallback = (...args: unknown[]) => void;

/**
 * 简单事件总线，用于组件间通信
 */
export class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  /**
   * 注册事件监听
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // 返回取消注册函数
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * 注册一次性事件监听
   */
  once(event: string, callback: EventCallback): () => void {
    const wrapper: EventCallback = (...args) => {
      callback(...args);
      off();
    };
    const off = this.on(event, wrapper);
    return off;
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          console.error(`[AimapKit EventBus] Error in event "${event}":`, err);
        }
      });
    }
  }

  /**
   * 移除指定事件的所有监听
   */
  off(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * 清除所有监听
   */
  clear(): void {
    this.listeners.clear();
  }
}

/**
 * 创建 EventBus 实例
 */
export function createEventBus(): EventBus {
  return new EventBus();
}