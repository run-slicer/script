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
    name: string;
    data: Uint8Array;
}

export interface EventMap {
    option_change: OptionChangeEvent;
    preload: PreloadEvent;
}

export type EntryType = "unspecific" | "class";

export interface Entry {
    type: EntryType;
    name: string;
}

export type TabType = "unspecific" | "welcome" | "code" | "hex" | "flow_graph";

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
    refresh(id: string, hard: boolean): Promise<void>;
}

export interface Disassembler {
    id: string;
    label: string;
    language?: string; // internal language ID, arbitrary

    run(data: Uint8Array): Promise<string>;
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
