import type { Editor } from "@tiptap/core";

import { cn } from "@/lib/utils";

type Props = {
  editor: Editor | null | undefined;
  wordCount: number;
  showCharacterCount?: boolean;
  showWordCount?: boolean;
  className?: string;
};

export default function EditorFooter({
  editor,
  wordCount,
  showCharacterCount = true,
  showWordCount = true,
  className,
}: Props) {
  const characters =
    showCharacterCount ? editor?.storage?.characterCount?.characters?.() ?? 0 : undefined;

  if (!showCharacterCount && !showWordCount) return null;

  return (
    <div
      className={cn(
        "flex h-7.5 justify-between items-center px-4 py-2 border-t border-border text-sm",
        className
      )}
    >
      <div className="flex gap-4">
        {showCharacterCount && <span>الحروف: {characters}</span>}
        {showWordCount && <span>الكلمات: {wordCount}</span>}
      </div>
    </div>
  );
}
