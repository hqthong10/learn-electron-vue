// composables/useTypedEventBus.ts
import { ref, inject, provide, onUnmounted, type Ref, type InjectionKey } from 'vue';

// Define event payload types
export interface EventPayloads {
    'room-exit': any;
    'room-start': any;
}

// Event types with full type safety
export const EventTypes = {
    ROOM_EXIT: 'room-exit' as const,
    ROOM_START: 'room-start' as const,
} as const;

export type EventType = keyof EventPayloads;
export type EventHandler<T extends EventType> = (payload: EventPayloads[T]) => void;
export type UnsubscribeFn = () => void;

// TypeScript interface for the event bus
export interface TypedEventBus {
    emit<T extends EventType>(eventType: T, payload: EventPayloads[T]): void;
    on<T extends EventType>(eventType: T, callback: EventHandler<T>): UnsubscribeFn;
    onMultiple(eventHandlers: {
        [K in EventType]?: EventHandler<K>;
    }): UnsubscribeFn;
    off<T extends EventType>(eventType: T, callback: EventHandler<T>): void;
    once<T extends EventType>(eventType: T, callback: EventHandler<T>): UnsubscribeFn;
    clear(): void;
    getListenerCount(eventType?: EventType): number;
}

const TypedEventBusSymbol: InjectionKey<TypedEventBus> = Symbol('TypedEventBus');

export function createTypedEventBus(): TypedEventBus {
    const listeners: Ref<Map<EventType, Set<EventHandler<any>>>> = ref(new Map());

    const emit = <T extends EventType>(eventType: T, payload: EventPayloads[T]): void => {
        const eventListeners = listeners.value.get(eventType);

        if (eventListeners && eventListeners.size > 0) {
            eventListeners.forEach((callback: EventHandler<T>) => {
                try {
                    callback(payload);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            });
        }
    };

    const on = <T extends EventType>(eventType: T, callback: EventHandler<T>): UnsubscribeFn => {
        if (!listeners.value.has(eventType)) {
            listeners.value.set(eventType, new Set());
        }

        const eventListeners = listeners.value.get(eventType) || null;
        eventListeners.add(callback);

        // Return unsubscribe function
        return () => {
            eventListeners.delete(callback);
            if (eventListeners.size === 0) {
                listeners.value.delete(eventType);
            }
        };
    };

    const off = <T extends EventType>(eventType: T, callback: EventHandler<T>): void => {
        const eventListeners = listeners.value.get(eventType);
        if (eventListeners) {
            eventListeners.delete(callback);
            if (eventListeners.size === 0) {
                listeners.value.delete(eventType);
            }
        }
    };

    const once = <T extends EventType>(eventType: T, callback: EventHandler<T>): UnsubscribeFn => {
        const wrappedCallback = (payload: EventPayloads[T]) => {
            callback(payload);
            off(eventType, wrappedCallback as EventHandler<T>);
        };
        return on(eventType, wrappedCallback as EventHandler<T>);
    };

    const onMultiple = (eventHandlers: {
        [K in EventType]?: EventHandler<K>;
    }): UnsubscribeFn => {
        const unsubscribers: UnsubscribeFn[] = [];

        Object.entries(eventHandlers).forEach(([eventType, handler]) => {
            if (handler) {
                unsubscribers.push(on(eventType as EventType, handler));
            }
        });

        return () => {
            unsubscribers.forEach((unsub) => unsub());
        };
    };

    const clear = (): void => {
        listeners.value.clear();
    };

    const getListenerCount = (eventType?: EventType): number => {
        if (eventType) {
            return listeners.value.get(eventType)?.size || 0;
        }

        let total = 0;
        listeners.value.forEach((eventListeners) => {
            total += eventListeners.size;
        });
        return total;
    };

    return {
        emit,
        on,
        off,
        once,
        onMultiple,
        clear,
        getListenerCount
    };
}

export function provideTypedEventBus(): TypedEventBus {
    const eventBus = createTypedEventBus();
    provide(TypedEventBusSymbol, eventBus);
    return eventBus;
}

export function useTypedEventBus(): TypedEventBus {
    const eventBus = inject(TypedEventBusSymbol);
    if (!eventBus) {
        throw new Error('useTypedEventBus must be used within a component that provides TypedEventBus');
    }
    return eventBus;
}

// Composable để auto cleanup với type safety
export function useEventListener<T extends EventType>(eventType: T, handler: EventHandler<T>): UnsubscribeFn {
    const eventBus = useTypedEventBus();

    const unsubscribe = eventBus.on(eventType, handler);

    onUnmounted(() => {
        unsubscribe();
    });

    return unsubscribe;
}

// Utility composable for handling multiple events with auto cleanup
export function useEventListeners(eventHandlers: {
    [K in EventType]?: EventHandler<K>;
}): UnsubscribeFn {
    const eventBus = useTypedEventBus();

    const unsubscribeAll = eventBus.onMultiple(eventHandlers);

    onUnmounted(() => {
        unsubscribeAll();
    });

    return unsubscribeAll;
}
