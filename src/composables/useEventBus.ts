import { ref, inject, provide } from 'vue';

const EventBusSymbol = Symbol('EventBus');

export function createEventBus() {
    const listeners = ref(new Map());

    const emit = (event: any, payload: any) => {
        const eventListeners = listeners.value.get(event) || [];
        eventListeners.forEach((callback: any) => callback(payload));
    };

    const on = (event: any, callback: any) => {
        const eventListeners = listeners.value.get(event) || [];
        eventListeners.push(callback);
        listeners.value.set(event, eventListeners);

        // Return unsubscribe function
        return () => {
            const newListeners = eventListeners.filter((cb: any) => cb !== callback);
            listeners.value.set(event, newListeners);
        };
    };

    const off = (event: any, callback: any) => {
        const eventListeners = listeners.value.get(event) || [];
        const newListeners = eventListeners.filter((cb: any) => cb !== callback);
        listeners.value.set(event, newListeners);
    };

    return { emit, on, off };
}

export function provideEventBus() {
    const eventBus = createEventBus();
    provide(EventBusSymbol, eventBus);
    return eventBus;
}

export function useEventBus() {
    const eventBus = inject(EventBusSymbol);
    if (!eventBus) {
        throw new Error('useEventBus must be used within a component that provides EventBus');
    }
    return eventBus;
}
