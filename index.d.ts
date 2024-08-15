export type EventType = "preload";

export interface Event<T> {
    type: EventType;
    payload: T;
}

export type EventListener<E extends Event<any>> = (event: E) => void | Promise<void>;

export interface PreloadEventPayload {
    data: Uint8Array;
}

export interface PreloadEvent extends Event<PreloadEventPayload> {
    type: "preload";
}

interface EventMap {
    preload: PreloadEvent;
}

export interface ScriptContext {
    addEventListener<K extends EventType>(type: K, listener: EventListener<EventMap[K]>): void;
    removeEventListener<K extends EventType>(type: K, listener: EventListener<EventMap[K]>): void;
    dispatchEvent<E extends Event<any>>(event: E): Promise<E>;
}

export interface Script {
    id: string;
    name?: string;
    description?: string;
    version?: string;

    load(context: ScriptContext): void | Promise<void>;
    unload(context: ScriptContext): void | Promise<void>;
}
