import { type Command, Extension } from "@tiptap/core";

// Normalize incoming font-size while preserving provided units.
// - number => `${n}px`
// - "14"   => "14px"
// - "1.25rem" => "1.25rem"
// - trims whitespace
function normalizeFontSize(value: string | number): string {
	if (typeof value === "number") return `${value}px`;
	const trimmed = value.toString().trim();
	return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

type FontSizeOptions = {
	types: string[];
};

export const FontSize = Extension.create<FontSizeOptions>({
	name: "fontSize",

	addOptions() {
		return {
			types: ["textStyle"],
		};
	},

	// Expose `fontSize` as a global attribute on textStyle.
	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					fontSize: {
						default: null as null | string,
						// Pull inline style font-size as-is, strip surrounding quotes if any.
						parseHTML: (element: HTMLElement) => {
							const raw = element.style.fontSize || "";
							const cleaned = raw.replace(/['"]/g, "").trim();
							return cleaned || null;
						},
						// Render style only when a value exists.
						renderHTML: (attributes: { fontSize?: string | null }) => {
							if (!attributes.fontSize) return {};
							return { style: `font-size: ${attributes.fontSize}` } as Record<string, string>;
						},
					},
				},
			},
		];
	},

	// Typed, safe commands without `as any`.
	addCommands() {
		return {
			// Set font-size keeping any provided unit, default to px when numeric.
			setFontSize:
				(fontSize: string | number): Command =>
				({ chain }) => {
					const normalized = normalizeFontSize(fontSize);
					return chain().setMark("textStyle", { fontSize: normalized }).run();
				},

			// Unset font-size, removing the attribute and cleaning empty textStyle marks.
			unsetFontSize:
				(): Command =>
				({ chain }) =>
					chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
		};
	},
});

export default FontSize;
