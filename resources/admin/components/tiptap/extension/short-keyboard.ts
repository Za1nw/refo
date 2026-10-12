import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";

// Minimal, safe typing for the commands we actually use.
// Assumes the corresponding extensions are registered: History (undo/redo), Bold, Italic, Heading, Paragraph.
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface CoreCommands {
	undo(): boolean;
	redo(): boolean;
}

interface CoreChain {
	focus(): CoreChain;
	toggleHeading(attrs: { level: HeadingLevel }): CoreChain;
	setParagraph(): CoreChain;
	toggleBold(): CoreChain;
	toggleItalic(): CoreChain;
	run(): boolean;
}

// Helpers to access a narrowly-typed API surface without using `any`.
const getCommands = (editor: Editor): CoreCommands =>
	editor.commands as unknown as CoreCommands;

const getChain = (editor: Editor): CoreChain =>
	editor.chain() as unknown as CoreChain;

// Generate heading shortcuts (Mod-Alt-1..6) and paragraph (Mod-Alt-0).
const createHeadingShortcuts = (editor: Editor): Record<string, () => boolean> => {
	const chain = () => getChain(editor);
	const shortcuts: Record<string, () => boolean> = {};

	([1, 2, 3, 4, 5, 6] as const).forEach((level) => {
		shortcuts[`Mod-Alt-${level}`] = () => chain().focus().toggleHeading({ level }).run();
	});

	shortcuts["Mod-Alt-0"] = () => chain().focus().setParagraph().run();

	return shortcuts;
};

export const KeyboardShortcuts = Extension.create({
	name: "keyboardShortcuts",

	// Type `this` to safely access `editor`.
	addKeyboardShortcuts(this: { editor: Editor }) {
		const editor = this.editor;
		const cmds = getCommands(editor);
		const chain = () => getChain(editor);

		return {
			// History
			"Mod-z": () => cmds.undo(),
			"Mod-y": () => cmds.redo(),
			"Shift-Mod-z": () => cmds.redo(),

			// Headings + Paragraph
			...createHeadingShortcuts(editor),

			// Marks
			"Mod-b": () => chain().focus().toggleBold().run(),
			"Mod-i": () => chain().focus().toggleItalic().run(),
		};
	},
});

export default KeyboardShortcuts;
