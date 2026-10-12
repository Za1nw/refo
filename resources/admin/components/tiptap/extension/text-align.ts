import { Extension, type CommandProps } from "@tiptap/core";

type TextAlignOptions = {
	types: string[];
	alignments: Array<"left" | "center" | "right" | "justify">;
	// default is unset to ensure no active button initially
	defaultAlignment?: "left" | "center" | "right" | "justify" | null;
};

// Reusable union type for alignment values
type Align = TextAlignOptions["alignments"][number];

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		textAlign: {
			setTextAlign: (alignment: Align) => ReturnType;
			unsetTextAlign: () => ReturnType;
		};
	}
}

export const TextAlign = Extension.create<TextAlignOptions>({
	name: "textAlign",

	addOptions() {
		return {
			types: [
				"paragraph",
				"heading",
				"textStyle",
				"listItem",
				"taskItem",
				"blockquote",
				"codeBlock",
				"image",
				"ImageAdvanced",
				"youtube",
				"Youtube",
				"div",
			],
			alignments: ["left", "center", "right", "justify"],
			defaultAlignment: null, // unset by default
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					textAlign: {
						// no default alignment; attribute absent until user chooses one
						default: null,
						parseHTML: (element: HTMLElement) =>
							((element.style.textAlign || null) as Align | null),
						renderHTML: ({ textAlign }: { textAlign?: Align | null }) => {
							// Render only when alignment is explicitly set
							if (!textAlign) return {};
							const classMap: Record<Align, string> = {
								left: "text-left",
								center: "text-center",
								right: "text-right",
								justify: "text-justify",
							};
							return { class: classMap[textAlign], style: `text-align: ${textAlign};` };
						},
					},
				},
			},
		];
	},

	addCommands() {
		// Helpers to validate and apply alignment across all configured types
		const isValidAlign = (alignment: Align) => this.options.alignments.includes(alignment);
		const applyToAll = (fn: (type: string) => boolean) => this.options.types.every(fn);

		const setTextAlign = (alignment: Align) => ({ commands }: CommandProps): boolean => {
			if (!isValidAlign(alignment)) return false;
			return applyToAll((type) => commands.updateAttributes(type, { textAlign: alignment }));
		};

		const unsetTextAlign = () => ({ commands }: CommandProps): boolean =>
			applyToAll((type) => commands.resetAttributes(type, "textAlign"));

		// Return top-level commands (type namespacing is for TS grouping only)
		return { setTextAlign, unsetTextAlign };
	},

	addKeyboardShortcuts() {
		// Toggle behavior: press the same hotkey again to unset
		const comboByAlign: Record<Align, string> = {
			left: "Ctrl-Shift-L",
			center: "Ctrl-Shift-E",
			right: "Ctrl-Shift-R",
			justify: "Ctrl-Shift-J",
		};

		const shortcuts: Record<string, () => boolean> = {};
		for (const [align, hotkey] of Object.entries(comboByAlign) as Array<[Align, string]>) {
			shortcuts[hotkey] = () => {
				const isActive = this.editor.isActive({ textAlign: align });
				return isActive
					? this.editor.commands.unsetTextAlign()
					: this.editor.commands.setTextAlign(align);
			};
		}
		return shortcuts;
	},
});

export default TextAlign;
