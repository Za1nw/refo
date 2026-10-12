import { Extension, type CommandProps } from "@tiptap/core";

// --- Helpers (sanitization) ---
const isSafeColor = (value: string): boolean => {
	const v = value.trim();
	if (!v) return false;
	const named = /^[a-zA-Z]+$/;
	const hex = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
	const rgb = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
	const hsl = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
	return named.test(v) || hex.test(v) || rgb.test(v) || hsl.test(v);
};

const sanitizeColor = (input: unknown): string | null => {
	if (typeof input !== "string") return null;
	const v = input.replace(/['"]/g, "").trim();
	return isSafeColor(v) ? v : null;
};

type BackgroundColorOptions = {
	types: string[];
};

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		backgroundColor: {
			setBackgroundColor: (backgroundColor: string) => ReturnType;
			unsetBackgroundColor: () => ReturnType;
		};
	}
}

export const BackgroundColor = Extension.create<BackgroundColorOptions>({
	name: "backgroundColor",

	addOptions() {
		return {
			types: ["textStyle"],
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					backgroundColor: {
						default: null as string | null,
						parseHTML: (element: HTMLElement) => {
							const raw = (element.style?.backgroundColor || "").trim();
							if (!raw) return null;
							const safe = sanitizeColor(raw);
							return safe ?? null;
						},
						renderHTML: (attributes: { backgroundColor?: string | null }) => {
							const value = attributes.backgroundColor ?? null;
							if (!value || !isSafeColor(value)) return {};
							return { style: `background-color: ${value}` } as Record<string, string>;
						},
					},
				},
			},
		];
	},

	addCommands() {
		return {
			setBackgroundColor:
				(backgroundColor: string) =>
				({ chain }: CommandProps) => {
					const safe = sanitizeColor(backgroundColor);
					if (!safe) return false;
					return chain().setMark("textStyle", { backgroundColor: safe }).run();
				},

			unsetBackgroundColor:
				() =>
				({ chain }: CommandProps) => {
					return chain()
						.setMark("textStyle", { backgroundColor: null })
						.removeEmptyTextStyle()
						.run();
				},
		};
	},
});

export default BackgroundColor;
