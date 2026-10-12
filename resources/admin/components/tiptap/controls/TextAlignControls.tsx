import { Button } from "@/components/ui/button";
// Removed DropdownMenu UI in favor of simple inline buttons
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import type { TextAlignValue } from "@/components/tiptap/types";
import { Editor } from "@tiptap/core";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type TextAlignControlsProps = { editor?: Editor | null };

export default function TextAlignControls({ editor }: TextAlignControlsProps) {
    if (!editor) return null;

    // Re-render on editor updates to reflect active alignment immediately
    const [, setTick] = useState(0);
    useEffect(() => {
        const rerender = () => setTick((t) => t + 1);
        editor.on("transaction", rerender);
        editor.on("selectionUpdate", rerender);
        editor.on("update", rerender);
        return () => {
            editor.off("transaction", rerender);
            editor.off("selectionUpdate", rerender);
            editor.off("update", rerender);
        };
    }, [editor]);

    // Keyboard shortcuts (displayed in titles)
    const SHORTCUTS: Record<TextAlignValue, string> = {
        left: "Ctrl+Shift+L",
        center: "Ctrl+Shift+E",
        right: "Ctrl+Shift+R",
        justify: "Ctrl+Shift+J",
    };

    // Single source of truth for all alignments (easy to extend)
    const ALIGN_META: Record<TextAlignValue, { icon: ReactNode; label: string }> = {
        left: { icon: <AlignLeft className="h-4 w-4" />, label: "محاذاة يسار" },
        center: { icon: <AlignCenter className="h-4 w-4" />, label: "محاذاة وسط" },
        right: { icon: <AlignRight className="h-4 w-4" />, label: "محاذاة يمين" },
        justify: { icon: <AlignJustify className="h-4 w-4" />, label: "ضبط النص" },
    };

    // Derive actions from metadata in a type-safe way
    const alignOptions = (Object.keys(ALIGN_META) as TextAlignValue[]).map((value) => {
        const meta = ALIGN_META[value];
        const tooltip = `${meta.label} — ${SHORTCUTS[value]}`;
        return {
            value,
            icon: meta.icon,
            tooltip,
            command: () => editor.chain().focus().setTextAlign(value).run(),
            isActive: () => editor.isActive({ textAlign: value }),
        };
    });

    // Inline button group (no default active alignment)
    return (
        <div role="group" aria-label="Text alignment" className="flex items-center gap-1">
            {alignOptions.map((opt) => {
                const pressed = opt.isActive();
                return (
                    <Button
                        key={opt.value}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => (pressed ? editor.chain().focus().unsetTextAlign().run() : opt.command())}
                        aria-label={opt.tooltip}
                        aria-pressed={pressed}
                        title={opt.tooltip}
                        className={`h-9 w-9 p-0 rounded-md border border-transparent hover:border-accent/40 hover:bg-accent/40 ${pressed ? "bg-accent" : ""}`}
                        data-active={pressed ? "true" : "false"}
                    >
                        {opt.icon}
                    </Button>
                );
            })}
        </div>
    );
}
