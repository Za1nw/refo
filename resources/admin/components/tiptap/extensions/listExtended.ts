import { Extension, Node } from "@tiptap/core";
import { BulletList, OrderedList, ListItem } from "@tiptap/extension-list";

// Predefined markers
const PRESET_SYMBOLS = {
	check: "✔",
	star: "★",
	dash: "–",
	square: "▣",
} as const;

type PresetType = "bullet" | "ordered" | keyof typeof PRESET_SYMBOLS;
type CustomType = `custom:${string}` | "custom";

// Public type (accepts custom payload form)
export type ListExtendedType = PresetType | CustomType;

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		listExtended: {
			toggleListType: (type: ListExtendedType) => ReturnType;
			indentList: () => ReturnType;
			outdentList: () => ReturnType;
			setSymbolListSymbol: (symbol: string) => ReturnType;
		};
	}
	interface AllExtensions {
		listExtended: any;
	}
}

// Tailwind classes applied on <ul> using arbitrary variants to affect its child <li>
// - Known symbols use static content utilities: [&>li]:before:content-['✔']
// - Custom symbols use a CSS variable fallback: [&>li]:before:content-[var(--symbol)]
const UL_BASE_CLASS =
	"list-none  [&>li]:relative  [&>li]:before:absolute ps-[1.5rem] [&>li]:before:start-[-1.2rem] [&>li]:before:opacity-90 dark:[&>li]:before:opacity-70 [&>li]:before:select-none";

const SYMBOL_KNOWN_UL_CLASSES: Record<string, string> = {
	"✔": `${UL_BASE_CLASS} [&>li]:before:content-['✔'] [&>li]:before:!start-[-1.5rem]`,
	"★": `${UL_BASE_CLASS} [&>li]:before:content-['★']`,
	"–": `${UL_BASE_CLASS} [&>li]:before:content-['–']`,
	"▣": `${UL_BASE_CLASS} [&>li]:before:content-['▣']`,
    // defaults to base class only
    "•": `${UL_BASE_CLASS} [&>li]:before:content-['•']`,
};

const SYMBOL_CUSTOM_UL_CLASS = `${UL_BASE_CLASS} [&>li]:before:content-[var(--symbol)]`;

const BULLET_UL_CLASS = "list-disc [&>li]:relative [&>li]:marker:absolute ps-[1.5rem] [&>li]:marker:start-[-1.2rem] [&>li]:marker:opacity-90 dark:[&>li]:marker:opacity-70 [&>li]:marker:select-none";
const ORDERED_UL_CLASS = "list-decimal [&>li]:relative  [&>li]:marker:absolute ps-[1.5rem] [&>li]:marker:start-[-1.2rem] [&>li]:marker:opacity-90 dark:[&>li]:marker:opacity-70 [&>li]:marker:select-none";

// Escapes for embedding string in CSS content: "..."
const toCssString = (s: string) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// Custom symbol list node
const SymbolList = Node.create({
	name: "symbolList",
	group: "block list",
	content: "listItem+",
	defining: true,

	addAttributes() {
		return {
			symbol: {
				default: "•",
				parseHTML: (element) =>
					(element as HTMLElement).getAttribute("data-symbol") || "•",
				renderHTML: (attributes) => {
					const symbol = attributes.symbol ?? "•";
					const known = SYMBOL_KNOWN_UL_CLASSES[symbol as string];
					const cls = known ? known : SYMBOL_CUSTOM_UL_CLASS;

					const htmlAttrs: Record<string, any> = {
						"data-list": "symbol",
						"data-symbol": symbol,
						class: cls,
					};

					// For custom symbols, attach inline CSS variable; known symbols don't need it
					if (!known) {
						htmlAttrs.style = `--symbol:"${toCssString(symbol)}";`;
					}

					return htmlAttrs;
				},
			},
		};
	},

	parseHTML() {
		return [{ tag: 'ul[data-list="symbol"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		// Merge any classes/styles provided by renderHTML of attributes with incoming HTMLAttributes
		const attrs = { ...HTMLAttributes };
		// Ensure class is preserved and trimmed
		if (HTMLAttributes.class && attrs.class) {
			attrs.class = `${HTMLAttributes.class} ${attrs.class}`.trim();
		}
		return ["ul", attrs, 0];
	},
});

// Parser
type ParsedListKind = { kind: "bullet" | "ordered" | "symbol"; symbol?: string };
const parseListExtendedType = (
	type: ListExtendedType,
	lastCustomSymbol = "•",
): ParsedListKind => {
	if (type === "bullet") return { kind: "bullet" };
	if (type === "ordered") return { kind: "ordered" };
	if (
		(Object.keys(PRESET_SYMBOLS) as Array<keyof typeof PRESET_SYMBOLS>).includes(
			type as any,
		)
	) {
		return { kind: "symbol", symbol: PRESET_SYMBOLS[type as keyof typeof PRESET_SYMBOLS] };
	}
	if (type === "custom") return { kind: "symbol", symbol: lastCustomSymbol || "•" };
	if (typeof type === "string" && type.startsWith("custom:")) {
		const payload = type.slice("custom:".length) || "•";
		return { kind: "symbol", symbol: payload };
	}
	return { kind: "bullet" };
};

const ListExtended = Extension.create({
	name: "listExtended",

	addStorage() {
		return {
			lastCustomSymbol: "•" as string,
		};
	},

	addExtensions() {
		return [
			BulletList.configure({
				keepMarks: true,
				keepAttributes: true,
				HTMLAttributes: { class: BULLET_UL_CLASS },
			}),
			OrderedList.configure({
				keepMarks: true,
				keepAttributes: true,
				HTMLAttributes: { class: ORDERED_UL_CLASS },
			}),
			ListItem,
			SymbolList,
		];
	},

	addCommands() {
		return {
			toggleListType:
				(type: ListExtendedType) =>
				({ editor }) => {
					const parsed = parseListExtendedType(type, this.storage.lastCustomSymbol);
					const chain = editor.chain().focus();

					if (parsed.kind === "bullet") {
						// معاملة واحدة: اطلب القائمة النقطية مباشرة
						return chain.toggleList("bulletList", "listItem").run();
					}

					if (parsed.kind === "ordered") {
						// معاملة واحدة: اطلب القائمة المرقمة مباشرة
						return chain.toggleList("orderedList", "listItem").run();
					}

					// kind === "symbol"
					const desiredSymbol = parsed.symbol || "•";
					if (
						typeof type === "string" &&
						(type === "custom" || type.startsWith("custom:"))
					) {
						this.storage.lastCustomSymbol = desiredSymbol;
					}

					if (editor.isActive("symbolList")) {
						const current = editor.getAttributes("symbolList")?.symbol;
						if (current === desiredSymbol) {
							return chain.toggleList("symbolList", "listItem").run();
						}
						return chain.updateAttributes("symbolList", { symbol: desiredSymbol }).run();
					}

					// لسنا داخل قائمة رمزية: لفّ كقائمة رمزية وحدث السمة في نفس السلسلة
					return chain
						.toggleList("symbolList", "listItem")
						.updateAttributes("symbolList", { symbol: desiredSymbol })
						.run();
				},

			setSymbolListSymbol:
				(symbol: string) =>
				({ editor }) => {
					const chain = editor.chain().focus();
					if (!editor.isActive("symbolList")) {
						chain.toggleList("symbolList", "listItem");
					}
					this.storage.lastCustomSymbol = symbol || "•";
					return chain.updateAttributes("symbolList", { symbol }).run();
				},

			indentList:
				() =>
				({ commands }) => {
					return commands.sinkListItem("listItem");
				},

			outdentList:
				() =>
				({ commands }) => {
					return commands.liftListItem("listItem");
				},
		};
	},

	addKeyboardShortcuts() {
		return {
			"Mod-Shift-1": () => this.editor.commands.toggleListType("bullet"),
			"Mod-Shift-2": () => this.editor.commands.toggleListType("ordered"),
			"Mod-Shift-3": () => this.editor.commands.toggleListType("check"),
			"Mod-Shift-4": () => this.editor.commands.toggleListType("star"),
			"Mod-Shift-5": () => this.editor.commands.toggleListType("dash"),
			"Mod-Shift-6": () => this.editor.commands.toggleListType("square"),
            "Mod-Shift-7": () => this.editor.commands.toggleListType("custom"),
			Tab: () => this.editor.commands.indentList(),
			"Shift-Tab": () => this.editor.commands.outdentList(),
			"Mod-]": () => this.editor.commands.indentList(),
			"Mod-[": () => this.editor.commands.outdentList(),
		};
	},
});

// Usage: [StarterKit.configure({ listItem: false }), ListExtended, ...]
export default ListExtended;
