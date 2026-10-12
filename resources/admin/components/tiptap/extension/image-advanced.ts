import { Node, mergeAttributes } from "@tiptap/core";

type ImageAdvancedAttrs = {
	src?: string | null;
	alt?: string | null;
	title?: string | null;
	width?: string | null;
	height?: string | null;
	loading?: "eager" | "lazy" | null;
	textAlign?: "left" | "center" | "right" | "justify" | null;
	style?: string | null;
};

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		ImageAdvanced: {
			addImage: (attrs: ImageAdvancedAttrs) => ReturnType;
		};
	}
}

// Helpers to read width/height from attribute or inline style (preserve px/%)
function readSizeAttr(el: HTMLElement, attrName: "width" | "height"): string | null {
	const htmlAttr = el.getAttribute(attrName);
	const styleValue = attrName === "width" ? el.style.width : el.style.height;
	const v = (htmlAttr && htmlAttr.trim()) || (styleValue && styleValue.trim()) || "";
	return v || null;
}

export const ImageAdvanced = Node.create({
	name: "ImageAdvanced",
	group: "inline",
	inline: true,
	selectable: true,
	draggable: true,
	atom: true,

	addAttributes() {
		return {
			src: { default: null },
			alt: { default: null },
			title: { default: null },
			width: {
				default: null,
				parseHTML: (element: HTMLElement) => readSizeAttr(element, "width"),
				renderHTML: (attributes: ImageAdvancedAttrs) =>
					attributes.width ? { width: attributes.width } : {},
			},
			height: {
				default: null,
				parseHTML: (element: HTMLElement) => readSizeAttr(element, "height"),
				renderHTML: (attributes: ImageAdvancedAttrs) =>
					attributes.height ? { height: attributes.height } : {},
			},
			loading: {
				default: "eager",
				parseHTML: (element: HTMLElement) => element.getAttribute("loading") || "eager",
				renderHTML: (attributes: ImageAdvancedAttrs) =>
					attributes.loading ? { loading: attributes.loading } : {},
			},
			textAlign: {
				default: null,
				parseHTML: (_element: HTMLElement) => null, // text-align عادة على الحاوية وليس img
				renderHTML: (attributes: ImageAdvancedAttrs) =>
					attributes.textAlign ? { style: `text-align: ${attributes.textAlign};` } : {},
			},
		};
	},

	parseHTML() {
		return [{ tag: "img[src]" }];
	},

	renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
		// Extract textAlign for wrapper, rest go to img
		const { textAlign, ...rest } = HTMLAttributes as ImageAdvancedAttrs & Record<string, unknown>;

		const pAttrs: Record<string, unknown> = {};
		if (textAlign) {
			pAttrs.style = `text-align: ${textAlign};`;
		}

		// Ensure display:inline-block; is preserved on the img
		const styleStr = typeof rest.style === "string" ? rest.style : "";
		const imgAttrs: Record<string, unknown> = {
			...rest,
			style: `${styleStr}${styleStr.endsWith(";") || styleStr === "" ? "" : ";"}display:inline-block;`,
		};

		return ["p", pAttrs, ["img", mergeAttributes(imgAttrs)]];
	},

	addCommands() {
		return {
			addImage:
				(attrs: ImageAdvancedAttrs) =>
				({ commands }) =>
					commands.insertContent({ type: this.name, attrs }),
		};
	},
});

export default ImageAdvanced;
