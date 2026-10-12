import {
	Extension,
	type Command,
	type CommandProps,
	type GlobalAttributes,
} from "@tiptap/core";

type ColorOptions = {
	/**
	 * List of mark types that can carry the `color` attribute.
	 * Defaults to ["textStyle"] for compatibility with Tiptap TextStyle.
	 */
	types: string[];
};

// Typesafe command augmentation for Tiptap
declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		color: {
			/**
			 * Apply a color to the target mark (defaults to TextStyle).
			 */
			setColor: (color: string) => ReturnType;
			/**
			 * Remove the color from the target mark (and clean empty TextStyle).
			 */
			unsetColor: () => ReturnType;
		};
	}
}

// --- Helpers (sanitization) ---
const isSafeColor = (value: string): boolean => {
	const v = value.trim();
	if (!v) return false;
	// Named colors (basic safety)
	const named = /^[a-zA-Z]+$/;
	// Hex colors
	const hex = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
	// rgb/rgba (case-insensitive)
	const rgb = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
	// hsl/hsla (case-insensitive)
	const hsl = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;

	return named.test(v) || hex.test(v) || rgb.test(v) || hsl.test(v);
};

const sanitizeColor = (input: unknown): string | null => {
	if (typeof input !== "string") return null;
	const v = input.replace(/['"]/g, "").trim();
	return isSafeColor(v) ? v : null;
};

export const Color = Extension.create<ColorOptions>({
	name: "color",

	// --- Options ---
	addOptions() {
		return {
			types: ["textStyle"],
		};
	},

	// --- Attributes ---
	addGlobalAttributes() {
		// Use a typed return for better TS support
		const attrs: GlobalAttributes = [
			{
				types: this.options.types,
				attributes: {
					color: {
						default: null as string | null,
						parseHTML: (element: HTMLElement) => {
							// Prefer inline style, fallback to deprecated `color` attribute.
							const raw =
								(element.style && element.style.color) ||
								element.getAttribute("color") ||
								"";
							return sanitizeColor(raw);
						},
						renderHTML: (attributes: { color?: string | null }): Record<string, string> => {
							const color = attributes.color ?? null;
							if (!color || !isSafeColor(color)) {
								return {};
							}
							return { style: `color: ${color}` };
						},
					},
				},
			},
		];
		return attrs;
	},

	// --- Commands ---
	addCommands() {
		// Resolve first available mark from options.types that exists in the schema.
		const resolveTargetMark = (props: CommandProps): string =>
			this.options.types.find((t) => !!props.editor.schema.marks[t]) ?? "textStyle";

		const commands: {
			setColor: (color: string) => Command;
			unsetColor: () => Command;
		} = {
			setColor:
				(color: string) =>
				(props: CommandProps) => {
					// Sanitize to avoid injecting invalid CSS
					const safe = sanitizeColor(color);
					if (!safe) return false;
					const mark = resolveTargetMark(props);
					return props.chain().setMark(mark, { color: safe }).run();
				},

			unsetColor:
				() =>
				(props: CommandProps) => {
					const mark = resolveTargetMark(props);
					// removeEmptyTextStyle only affects textStyle; still safe when mark differs.
					return props.chain().setMark(mark, { color: null }).removeEmptyTextStyle().run();
				},
		};

		return commands;
	},
});

export default Color;
