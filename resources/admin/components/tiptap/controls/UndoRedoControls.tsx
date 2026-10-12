import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider, // أضفنا Provider للتحكم العام
} from "@/components/ui/tooltip";
import { Undo2, Redo2 } from "lucide-react";
import { Editor } from "@tiptap/core";
import { useEffect, useState } from "react";

type UndoRedoControlsProps = { editor?: Editor  | null };

export default function UndoRedoControls({ editor }: UndoRedoControlsProps) {
  const [canUndoState, setCanUndoState] = useState(false);
  const [canRedoState, setCanRedoState] = useState(false);

  const computeCan = () => {
    if (!editor) {
      setCanUndoState(false);
      setCanRedoState(false);
      return;
    }

    try {
      const canU = editor?.can?.().undo?.() ?? false;
      const doneLen = ((editor.state as any).history?.done?.length ?? 0) > 0;
      const canR = editor?.can?.().redo?.() ?? false;
      const undoneLen = ((editor.state as any).history?.undone?.length ?? 0) > 0;

      setCanUndoState(Boolean(canU || doneLen));
      setCanRedoState(Boolean(canR || undoneLen));
    } catch (_) {
      setCanUndoState(((editor.state as any).history?.done?.length ?? 0) > 0);
      setCanRedoState(((editor.state as any).history?.undone?.length ?? 0) > 0);
    }
  };

  useEffect(() => {
    computeCan();

    if (!editor) return;
    const onUpdate = () => computeCan();
    const onTransaction = () => computeCan();

    editor.on("update", onUpdate);
    editor.on("transaction", onTransaction);

    return () => {
      try {
        editor.off("update", onUpdate);
        editor.off("transaction", onTransaction);
      } catch (_) {
        // ignore
      }
    };
  }, [editor]);

  return (
    <TooltipProvider delayDuration={1000}>
      <div className="flex items-center gap-1">
        <Tooltip >
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              type="button"
              size="icon"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!canUndoState}
              className="h-8 w-8"
            >
              <Undo2 className="h-4 w-4" />
              <span className="sr-only">تراجع (Ctrl+Z)</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div>تراجع (Ctrl+Z)</div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!canRedoState}
              className="h-8 w-8"
            >
              <Redo2 className="h-4 w-4" />
              <span className="sr-only">إعادة (Ctrl+Y)</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div>إعادة (Ctrl+Y)</div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const UndoRedoButton = ({ editor }: { editor: Editor | null }) => {
  return <UndoRedoControls editor={editor} />;
};
