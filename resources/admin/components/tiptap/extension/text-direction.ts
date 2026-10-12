import { Extension } from "@tiptap/core";

// Add this module augmentation so TS knows about the custom commands.
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockTextDirection: {
      setBlockTextDirection: (direction: "ltr" | "rtl" | null) => ReturnType;
      unsetTextDirection: () => ReturnType;
    };
  }
}

export const TextDirection = Extension.create({
  name: "blockTextDirection",

  addOptions() {
    return {
      directions: ["ltr", "rtl"] as const, // no default
    };
  },

  addGlobalAttributes() {
    const types = [
      "paragraph",
      "heading",
      "listItem",
      "orderedList",
      "bulletList",
      "blockquote",
    ];
    return [
      {
        types,
        attributes: {
          dir: {
            // no default dir written; only when explicitly set
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute("dir"),
            renderHTML: (attributes: Record<string, any>) => {
              const dir = attributes.dir;
              if (!dir) return {};
              if (!this.options.directions.includes(dir)) return {};
              return { dir };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    const targetTypes = [
      "paragraph",
      "heading",
      "listItem",
      "orderedList",
      "bulletList",
      "blockquote",
    ] as const;

    const applyDir = (commands: any, dir: "ltr" | "rtl" | null) => {
      let applied = false;
      for (const type of targetTypes) {
        const did = commands.updateAttributes(type as any, { dir });
        applied = applied || !!did;
      }
      return applied;
    };

    return {
      setBlockTextDirection:
        (direction: "ltr" | "rtl" | null) =>
        ({ commands }) =>
          applyDir(commands, direction),
      unsetTextDirection:
        () =>
        ({ commands }) =>
          applyDir(commands, null),
    };
  },
});
