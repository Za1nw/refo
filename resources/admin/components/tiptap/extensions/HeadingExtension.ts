import { Extension } from "@tiptap/core";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    headingExtension: {
      applyParagraph: () => ReturnType;
      applyHeading: (attrs: { level: HeadingLevel }) => ReturnType;
      toggleHeadingLevel: (attrs: { level: HeadingLevel }) => ReturnType;
    };
  }
}

const HeadingExtension = Extension.create({
  name: "headingExtension",

  // تضمين الفقرة وعناوين H1..H6
  addExtensions() {
    return [
      Paragraph,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    ];
  },

  // أوامر مساعدة
  addCommands() {
    return {
      applyParagraph:
        () =>
        ({ commands }) =>
          commands.setParagraph(),
      applyHeading:
        (attrs) =>
        ({ commands }) =>
          commands.setHeading(attrs),
      toggleHeadingLevel:
        (attrs) =>
        ({ commands }) =>
          commands.toggleHeading(attrs),
    };
  },
});

export default HeadingExtension;
