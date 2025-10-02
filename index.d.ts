type Awaitable<T> = T | PromiseLike<T>;

/**
 * A type of {@link Option}.
 */
export type OptionType = "group" | "button" | "checkbox" | "radio";

/**
 * An option that can be configured by the user in the script's menu (Scripts -> <script name> -> <option name>).
 */
export interface Option {
    /**
     * The type of the option.
     */
    readonly type: OptionType;
    /**
     * The unique identifier of the option.
     */
    readonly id: string;
    /**
     * A human-readable name for the option, defaults to {@link id} if not provided.
     */
    readonly label?: string;
}

/**
 * An option that contains other options.
 */
export interface GroupOption extends Option {
    readonly type: "group";
    /**
     * The options contained within this group.
     */
    readonly options: Option[];
}

/**
 * An option that represents a button that can be clicked.
 */
export interface ButtonOption extends Option {
    readonly type: "button";
}

/**
 * An option that represents a checkbox that can be checked or unchecked.
 */
export interface CheckboxOption extends Option {
    readonly type: "checkbox";
    /**
     * Whether the checkbox is checked or not, mutable only by the user.
     */
    readonly checked: boolean;
}

/**
 * A radio button item within a {@link RadioOption}.
 */
export interface RadioItem {
    /**
     * The unique identifier of the radio item.
     */
    readonly id: string;
    /**
     * A human-readable name for the radio item, defaults to {@link id} if not provided.
     */
    readonly label?: string;
}

/**
 * An option that represents a set of radio buttons, where only one can be selected at a time.
 */
export interface RadioOption extends Option {
    readonly type: "radio";
    /**
     * The radio items within this option.
     */
    readonly items: RadioItem[];
    /**
     * The {@link RadioItem#id} of the currently selected radio item, mutable only by the user.
     */
    readonly selected: string;
}

/**
 * A type of {@link Event}.
 */
export type EventType = "option_change" | "preload";

/**
 * An event emitted onto an event bus.
 */
export interface Event {
    /**
     * The type of the event.
     */
    readonly type: EventType;
}

/**
 * A function for receiving events.
 * @param event The event being emitted.
 * @param context The script context in which the event is being emitted.
 */
export type EventListener<E extends Event> = (event: E, context: ScriptContext) => Awaitable<void>;

/**
 * An event emitted when an {@link Option} is changed by the user.
 */
export interface OptionChangeEvent extends Event {
    readonly type: "option_change";
    /**
     * The option that was changed.
     */
    readonly option: Option;
}

/**
 * An event emitted when a workspace entry is to be interpreted (read) in a tab.
 */
export interface PreloadEvent extends Event {
    readonly type: "preload";
    /**
     * The name of the entry being loaded ({@link Entry#name}).
     */
    readonly name: string;
    /**
     * The *transformed* raw data of the entry being loaded ({@link Entry#bytes}), mutable.
     */
    data: Uint8Array;
}

/**
 * Mapping of event types to their corresponding event interfaces.
 */
export interface EventMap {
    option_change: OptionChangeEvent;
    preload: PreloadEvent;
}

/**
 * An entry in the workspace, which can be opened in a tab.
 */
export interface Entry {
    /**
     * The type of the entry, defined by slicer internally (e.g. "file", "class", "archive", etc.).
     */
    readonly type: string;
    /**
     * The unique name of the entry (e.g. "HelloWorld.class", "lib/example.jar", etc.).
     */
    readonly name: string;

    /**
     * Returns the raw data of the entry as a byte array.
     */
    bytes(): Awaitable<Uint8Array>;

    /**
     * Returns the raw data of the entry as a {@link Blob}.
     */
    blob(): Awaitable<Blob>;
}

/**
 * A tab in the UI.
 */
export interface Tab {
    /**
     * The type of the tab, defined by slicer internally (e.g. "code", "class", "graph", etc.).
     */
    readonly type: string;
    /**
     * The unique identifier of the tab.
     */
    readonly id: string;
    /**
     * A human-readable name for the tab (e.g. "HelloWorld.class", "Welcome", etc.).
     */
    readonly label: string;
    /**
     * The position of the tab in the UI, defined in slicer internally (e.g. "primary_center", "secondary_left", etc.).
     */
    readonly position: string;
    /**
     * Whether the tab is currently active (focused) in the UI.
     *
     * There can be multiple active tabs if they are in different positions.
     */
    readonly active: boolean;
    /**
     * The entry opened in the tab, or `null` if the tab is not associated with any entry (e.g. a welcome tab).
     */
    readonly entry: Entry | null;
}

/**
 * The editor context, which allows interaction with the tabs in the UI.
 */
export interface EditorContext {
    /**
     * Returns all tabs currently open in the UI.
     */
    tabs(): Tab[];

    /**
     * Finds a tab by its unique identifier.
     * @param id The unique identifier of the tab.
     * @returns The tab with the given ID, or `null` if no such tab exists.
     */
    find(id: string): Tab | null;

    /**
     * Returns the tab currently active in the "primary_center" position.
     * @returns The tab, or `null` if no tab is active in that position.
     */
    current(): Tab | null;

    /**
     * Refreshes a tab.
     * @param id The unique identifier of the tab to refresh.
     * @param hard Whether to perform a hard refresh, which retransforms the associated entry (and fires {@link PreloadEvent}). Defaults to `false`.
     */
    refresh(id: string, hard?: boolean): Awaitable<void>;

    /**
     * Adds a new tab to the UI and makes it active.
     *
     * If a tab with the same type and entry already exists, it will be made active instead of creating a new one.
     * @param type The type of the tab to add (e.g. "code", "class", "graph", etc.).
     * @param entry The entry associated with the tab. If omitted, the tab will not be associated with any entry (e.g. a welcome tab).
     * @returns The newly created tab.
     */
    add(type: string, entry?: Entry): Awaitable<Tab>;

    /**
     * Removes a tab from the UI.
     *
     * If the tab is currently active, the next tab in the same position will be made active instead.
     * @param id The unique identifier of the tab to remove.
     */
    remove(id: string): void;

    /**
     * Removes all tabs from the UI.
     */
    clear(): void;
}

/**
 * A function that provides the raw bytecode of a class by its name.
 * @param name The fully qualified name of the class (e.g. "com/example/HelloWorld").
 * @returns The raw bytecode of the class as a byte array, or `null` if the class could not be found.
 */
export type ClassDataSource = (name: string) => Awaitable<Uint8Array | null>;

/**
 * A disassembler that can convert bytecode into human-readable assembly code (or a Java approximation - decompilation).
 */
export interface Disassembler {
    /**
     * The unique identifier of the disassembler (e.g. "procyon", "cfr", "vf", etc.).
     */
    readonly id: string;
    /**
     * A human-readable name for the disassembler (e.g. "Procyon", "CFR", "Vineflower", etc.), defaults to the {@link id}.
     */
    readonly label?: string;
    /**
     * The version of the disassembler as shown in the UI.
     */
    readonly version?: string;
    /**
     * The programming language the disassembler outputs (e.g. "java", "kotlin", etc.), defaults to plain text ("plaintext").
     */
    readonly language?: string;
    /**
     * Options passed to the disassembler, mutable.
     */
    options?: Record<string, string>;

    /**
     * Disassembles a class by its name using the provided data source to fetch the raw bytecode.
     *
     * This function must be implemented by the disassembler.
     * @param name The fully qualified name of the class to disassemble (e.g. "com/example/HelloWorld").
     * @param source A function that provides the raw bytecode of a class by its name.
     * @returns The disassembled code as a string.
     */
    readonly class: (name: string, source: ClassDataSource) => Awaitable<string>;
    /**
     * Disassembles a method by its name and signature using the provided data source to fetch the raw bytecode of the containing class.
     *
     * This function is optional; if not provided, only class-level disassembly will be available.
     * @param name The fully qualified name of the class containing the method (e.g. "com/example/HelloWorld").
     * @param signature The method signature (e.g. "main([Ljava/lang/String;)V").
     * @param source A function that provides the raw bytecode of a class by its name.
     * @returns The disassembled method code as a string.
     */
    readonly method?: (name: string, signature: string, source: ClassDataSource) => Awaitable<string>;
}

/**
 * The disassembler context, which allows interaction with the available disassemblers.
 */
export interface DisassemblerContext {
    /**
     * Returns all registered disassemblers.
     */
    all(): Disassembler[];

    /**
     * Finds a disassembler by its unique identifier.
     * @param id The unique identifier of the disassembler.
     * @returns The disassembler with the given ID, or `null` if no such disassembler exists.
     */
    find(id: string): Disassembler | null;

    /**
     * Registers a new disassembler.
     * @param disasm The disassembler to register.
     */
    add(disasm: Disassembler): void;

    /**
     * Removes a disassembler by its unique identifier.
     * @param id The unique identifier of the disassembler to remove.
     */
    remove(id: string): void;
}

/**
 * The workspace context, which allows interaction with the entries in the workspace.
 */
export interface WorkspaceContext {
    /**
     * Returns all entries in the workspace.
     */
    entries(): Entry[];

    /**
     * Finds an entry by its unique name.
     * @param name The unique name of the entry.
     * @returns The entry with the given name, or `null` if no such entry exists.
     */
    find(name: string): Entry | null;

    /**
     * Adds a new entry to the workspace.
     * @param name The unique name of the entry (e.g. "HelloWorld.class", "lib/example.jar", etc.).
     * @param data The raw data of the entry as a byte array or a {@link Blob}.
     * @returns The newly created entry.
     */
    add(name: string, data: Uint8Array | Blob): Awaitable<Entry>;

    /**
     * Removes an entry from the workspace by its unique name.
     * @param name The unique name of the entry to remove.
     */
    remove(name: string): void;

    /**
     * Removes all entries from the workspace.
     */
    clear(): void;
}

/**
 * The context in which a script is executed, providing access to the editor, disassembler, and workspace contexts,
 * as well as event handling capabilities.
 */
export interface ScriptContext {
    /**
     * The script associated with this context.
     */
    script: Script;
    /**
     * The parent context, or `null` if this is the root context.
     */
    parent: ScriptContext | null;

    /**
     * The editor context, which allows interaction with the tabs in the UI.
     */
    editor: EditorContext;
    /**
     * The disassembler context, which allows interaction with the available disassemblers.
     */
    disasm: DisassemblerContext;
    /**
     * The workspace context, which allows interaction with the entries in the workspace.
     */
    workspace: WorkspaceContext;

    /**
     * Adds an event listener for the specified event type.
     * @param type The type of event to listen for.
     * @param listener The function to call when the event is emitted.
     */
    addEventListener<K extends EventType>(type: K, listener: EventListener<EventMap[K]>): void;

    /**
     * Removes an event listener for the specified event type.
     * @param type The type of event the listener was registered for.
     * @param listener The listener function to remove.
     */
    removeEventListener<K extends EventType>(type: K, listener: EventListener<EventMap[K]>): void;

    /**
     * Dispatches an event to all registered listeners for its type.
     * @param event The event to dispatch.
     * @returns The dispatched event, possibly mutated by listeners.
     */
    dispatchEvent<E extends Event>(event: E): Awaitable<E>;
}

/**
 * The script interface, which must be exported by all scripts.
 */
export interface Script {
    /**
     * A human-readable name for the script.
     */
    readonly name?: string;
    /**
     * A human-readable description of the script.
     */
    readonly description?: string;
    /**
     * The version of the script as shown in the UI.
     */
    readonly version?: string;
    /**
     * The options configurable by the user in the script's menu.
     */
    readonly options?: Option[];

    /**
     * Called when the script is loaded.
     * @param context The context in which the script is being loaded.
     */
    load(context: ScriptContext): Awaitable<void>;

    /**
     * Called when the script is unloaded.
     *
     * This is the last chance to clean up any resources or state associated with the script.
     * @param context The context in which the script is being unloaded.
     */
    unload(context: ScriptContext): Awaitable<void>;
}
