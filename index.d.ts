export type OptionType = "group" | "button" | "checkbox" | "radio";

export interface Option {
    type: OptionType;
    id: string;
    label?: string;
}

export interface GroupOption extends Option {
    type: "group";
    options: Option[];
}

export interface ButtonOption extends Option {
    type: "button";
}

export interface CheckboxOption extends Option {
    type: "checkbox";
    checked: boolean;
}

export interface RadioItem {
    id: string;
    label?: string;
}

export interface RadioOption extends Option {
    type: "radio";
    items: RadioItem[];
    selected: string; // id
}

export type EventType = "option_change" | "preload";

export interface Event {
    type: EventType;
}

export type EventListener<E extends Event> = (event: E, context: ScriptContext) => void | Promise<void>;

export interface OptionChangeEvent extends Event {
    type: "option_change";
    option: Option;
}

export interface PreloadEvent extends Event {
    type: "preload";
    data: Uint8Array;
}

interface EventMap {
    option_change: OptionChangeEvent;
    preload: PreloadEvent;
}

export interface ScriptContext {
    script: Script;
    parent: ScriptContext | null;

    addEventListener<K extends EventType>(type: K, listener: EventListener<EventMap[K]>): void;
    removeEventListener<K extends EventType>(type: K, listener: EventListener<EventMap[K]>): void;
    dispatchEvent<E extends Event>(event: E): Promise<E>;
}

export interface Script {
    name?: string;
    description?: string;
    version?: string;
    options?: Option[];

    load(context: ScriptContext): void | Promise<void>;
    unload(context: ScriptContext): void | Promise<void>;
}
