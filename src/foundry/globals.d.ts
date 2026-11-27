// Foundry globals, typed loosely on purpose: only what the adapter touches, and `any` so a Foundry
// version change never breaks the pure core. (foundry-vtt-types can replace this later.)
declare const game: any;
declare const canvas: any;
declare const ui: any;
declare const CONFIG: any;
declare const foundry: any;
declare const ChatMessage: any;
declare const __CORE_VERSION__: string | undefined;   // replaced at build time
declare const Hooks: any;
declare const fromUuidSync: any;
declare const PIXI: any;
declare const Sequence: any;    // Sequencer module (optional: the code checks it exists)
declare const Sequencer: any;
