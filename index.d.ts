type Awaitable<T> = T | PromiseLike<T>;

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

export type EventListener<E extends Event> = (event: E, context: ScriptContext) => Awaitable<void>;

export interface OptionChangeEvent extends Event {
    type: "option_change";
    option: Option;
}

export interface PreloadEvent extends Event {
    type: "preload";
    name: string;
    data: Uint8Array;
}

export interface EventMap {
    option_change: OptionChangeEvent;
    preload: PreloadEvent;
}

export type EntryType = "unspecific" | "class" | "archive";

export interface Entry {
    type: EntryType;
    name: string;
}

export type TabType = "unspecific" | "welcome" | "code" | "hex" | "flow_graph" | "image";

export interface Tab {
    type: TabType;
    id: string;
    label: string;
    entry: Entry | null;
}

export interface EditorContext {
    tabs(): Tab[];
    find(id: string): Tab | null;
    current(): Tab | null;
    refresh(id: string, hard: boolean): Awaitable<void>;
}

export type ClassDataSource = (name: string) => Awaitable<Uint8Array | null>;

export interface Disassembler {
    id: string;
    label?: string;
    language?: string; // internal language ID, arbitrary

    class: (name: string, source: ClassDataSource) => Awaitable<string>;
    method?: (name: string, signature: string, source: ClassDataSource) => Awaitable<string>;
}

export interface DisassemblerContext {
    all(): Disassembler[];
    find(id: string): Disassembler | null;
    add(disasm: Disassembler): void;
    remove(id: string): void;
}

export interface ScriptContext {
    script: Script;
    parent: ScriptContext | null;

    editor: EditorContext;
    disasm: DisassemblerContext;

    addEventListener<K extends EventType>(type: K, listener: EventListener<EventMap[K]>): void;
    removeEventListener<K extends EventType>(type: K, listener: EventListener<EventMap[K]>): void;
    dispatchEvent<E extends Event>(event: E): Awaitable<E>;
}

export interface Script {
    name?: string;
    description?: string;
    version?: string;
    options?: Option[];

    load(context: ScriptContext): Awaitable<void>;
    unload(context: ScriptContext): Awaitable<void>;
}
