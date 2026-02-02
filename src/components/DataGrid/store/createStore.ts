
import { useSyncExternalStore } from 'react';

// Basic Observer Pattern Store for High Performance
export class Store<T> {
    private state: T;
    private listeners: Set<() => void> = new Set();

    constructor(initialState: T) {
        this.state = initialState;
    }

    getState = () => {
        return this.state;
    };

    setState = (fn: ((current: T) => Partial<T> | T) | Partial<T>) => {
        const next = typeof fn === 'function' ? (fn as Function)(this.state) : fn;

        // Simple shallow merge if it's an object, or replace
        if (typeof next === 'object' && next !== null && typeof this.state === 'object' && this.state !== null) {
            this.state = { ...this.state, ...next };
        } else {
            this.state = next;
        }

        this.listeners.forEach((l) => l());
    };

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };
}

export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
    return useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState()),
        () => selector(store.getState()) // server snapshot (optional)
    );
}
