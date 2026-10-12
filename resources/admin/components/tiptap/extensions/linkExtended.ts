import { Editor, getMarkRange, mergeAttributes } from "@tiptap/core";
import Link, { type LinkOptions } from "@tiptap/extension-link";

export type LinkAttrs = {
	href: string;
	target?: "_blank" | "_self" | "_parent" | "_top" | string | null;
	rel?: "noopener" | "noreferrer" | "nofollow" | (string & {}) | null;
	title?: string | null;
	class?: string | null;
	style?: string | null;
	[key: string]: any; // future-friendly
};

export type LinkInfo = {
	href: string;
	text: string;
	range: { from: number; to: number } | null;
	attrs: Partial<LinkAttrs>;
};

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		linkExtended: {
			setLinkExtended: (attrs: LinkAttrs) => ReturnType;
			unsetLinkExtended: () => ReturnType;
			toggleLinkExtended: (attrs: LinkAttrs) => ReturnType;
		};
	}
}

const LinkExtended = Link.extend<
	LinkOptions,
	{ getLinkInfo: (editor: Editor) => LinkInfo }
>({
	// override the default mark by keeping the same name
	name: "link",

	addOptions() {
		return {
			...this.parent!(),
			// Avoid base extension’s default HTMLAttributes stomping over class/style/title
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		const parent = this.parent?.() ?? {};
		return {
			...parent,
			title: {
				default: null,
				parseHTML: (el: HTMLElement) => el.getAttribute("title"),
				renderHTML: attrs => (attrs.title ? { title: attrs.title } : {}),
			},
			class: {
				default: null,
				parseHTML: (el: HTMLElement) => el.getAttribute("class"),
				renderHTML: attrs => (attrs.class ? { class: attrs.class } : {}),
			},
			style: {
				default: null,
				parseHTML: (el: HTMLElement) => el.getAttribute("style"),
				renderHTML: attrs => (attrs.style ? { style: attrs.style } : {}),
			},
			target: {
				default: parent["target"]?.default ?? null,
				parseHTML: (el: HTMLElement) => el.getAttribute("target"),
				renderHTML: (attrs: any) => (attrs.target ? { target: attrs.target } : {}),
			},
			rel: {
				default: parent["rel"]?.default ?? null,
				parseHTML: (el: HTMLElement) => el.getAttribute("rel"),
				renderHTML: (attrs: any) => (attrs.rel ? { rel: attrs.rel } : {}),
			},
		};
	},

	// Ensure custom attrs are rendered even if base merge would omit them
	renderHTML({ HTMLAttributes, mark }) {
		return [
			"a",
			mergeAttributes(
				this.options.HTMLAttributes,
				HTMLAttributes,
				mark?.attrs?.title ? { title: mark.attrs.title } : {},
				mark?.attrs?.class ? { class: mark.attrs.class } : {},
				mark?.attrs?.style ? { style: mark.attrs.style } : {},
			),
			0,
		];
	},

	addStorage() {
		return {
			getLinkInfo: (editor: Editor): LinkInfo => {
				const attrs = (editor.getAttributes("link") ?? {}) as Partial<LinkAttrs>;
				const { from, to, empty } = editor.state.selection;

				let range: { from: number; to: number } | null = null;
				let text = "";

				if (empty && editor.isActive("link")) {
					const type = editor.schema.marks.link;
					const r = getMarkRange(editor.state.doc.resolve(from), type);
					if (r) {
						range = r;
						text = editor.state.doc.textBetween(r.from, r.to, " ");
					}
				} else if (!empty) {
					const type = editor.schema.marks.link;
					const r = getMarkRange(editor.state.doc.resolve(from), type);
					if (r && r.from <= from && r.to >= to) {
						range = { from, to };
						text = editor.state.doc.textBetween(from, to, " ");
					}
				}

				return {
					href: attrs.href ?? "",
					text,
					range,
					attrs,
				};
			},
		};
	},

	addCommands() {
		return {
			...this.parent?.(),
			setLinkExtended:
				(attrs: LinkAttrs) =>
				({ chain }) =>
					chain().extendMarkRange("link").setLink(attrs as any).run(),
			unsetLinkExtended:
				() =>
				({ chain }) =>
					chain().extendMarkRange("link").unsetLink().run(),
			toggleLinkExtended:
				(attrs: LinkAttrs) =>
				({ chain }) =>
					chain().extendMarkRange("link").toggleLink(attrs as any).run(),
		};
	},
});

export default LinkExtended;
