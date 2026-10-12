import type { AnyExtension } from "@tiptap/core";
import CharacterCountExtension from "@tiptap/extension-character-count";
import LinkExtension from "@tiptap/extension-link";
import SubscriptExtension from "@tiptap/extension-subscript";
import SuperscriptExtension from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import UnderlineExtension from "@tiptap/extension-underline";
import StarterKitExtension from "@tiptap/starter-kit";

// custom extensions
import { BackgroundColor } from "./extension/background-color";
import { Color } from "./extension/color";
import { FontSize } from "./extension/font-size";
import { ImageAdvanced } from "./extension/image-advanced";
import { KeyboardShortcuts } from "./extension/short-keyboard";
import { TextAlign } from "./extension/text-align";
import { Youtube } from "./extension/Youtube";
import LinkExtended from "./extensions/linkExtended";
import ListExtended from "./extensions/listExtended";

type BuildOptions = {
  enableCharacterCount?: boolean;
  linkHTMLAttributes?: Record<string, string>;
  additional?: AnyExtension[];
};

type ExtensionLike = {
  name?: unknown;
  type?: unknown;
  config?: {
    name?: unknown;
    type?: unknown;
  };
};

function getExtensionMeta(ext: AnyExtension): { name?: string; type?: string } {
  const e = ext as unknown as ExtensionLike;

  const name =
    typeof e.name === "string"
      ? e.name
      : typeof e.config?.name === "string"
        ? e.config.name
        : undefined;

  const type =
    typeof e.type === "string"
      ? e.type
      : typeof e.config?.type === "string"
        ? e.config.type
        : undefined;

  return { name, type };
}

// Build a stable key using both name and type to avoid duplicate-name conflicts across types.
function extKey(ext: AnyExtension, fallback: string): string {
  const { name, type } = getExtensionMeta(ext);
  return `${type ?? "extension"}:${name ?? fallback}`;
}

// Dedupe by (type,name), keeping the last occurrence (user overrides win)
function dedupeExtensions(list: AnyExtension[]): AnyExtension[] {
  const seen = new Set<string>();
  const result: AnyExtension[] = [];
  for (let i = list.length - 1; i >= 0; i--) {
    const ext = list[i];
    const key = extKey(ext, `__idx_${i}`);
    if (!seen.has(key)) {
      seen.add(key);
      result.unshift(ext);
    }
  }
  return result;
}

export function buildEditorExtensions(opts: BuildOptions = {}): AnyExtension[] {
  const {
    enableCharacterCount = true,
    linkHTMLAttributes = {
      rel: "noopener noreferrer",
      target: "_blank",
      class: "cursor-pointer rounded px-0.5",
    },
    additional = [],
  } = opts;

  // Pre-dedupe "additional" to minimize duplicates early.
  const additionalDeduped = dedupeExtensions(additional);

  // Snapshot of names present in additional to conditionally include built-ins.
  const additionalNames = new Set(
    additionalDeduped.map((ext, i) => getExtensionMeta(ext).name ?? `__idx_${i}`)
  );

  const base: AnyExtension[] = [
    StarterKitExtension.configure({
      listItem: false,
      bulletList: false,
      orderedList: false,
      link: false,
      underline: false,
    }),
    ListExtended,
    TextStyle,
    SuperscriptExtension,
    SubscriptExtension,
    UnderlineExtension,
    KeyboardShortcuts,
    FontSize,
    Color,
    BackgroundColor,
    TextAlign,
    LinkExtended,
    ImageAdvanced,
    Youtube,
  ];

  // Only include Underline/Link if user didn't supply them.
  if (!additionalNames.has("underline")) {
    base.push(UnderlineExtension);
  }
  if (!additionalNames.has("link")) {
    base.push(
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: linkHTMLAttributes,
      })
    );
  }

  if (enableCharacterCount) {
    base.push(CharacterCountExtension.configure({ limit: null }));
  }

  // Remove duplicates by (type,name); prefer user-provided "additional" versions.
  return dedupeExtensions([...base, ...additionalDeduped]);
}
