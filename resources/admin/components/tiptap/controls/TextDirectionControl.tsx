import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Editor } from "@tiptap/core";
import LtrIcon from "@/components/icons/ltr-icon";
import RtlIcon from "@/components/icons/rtl-icon";

type TextDirection = "ltr" | "rtl" | null;
type TextDirectionControlProps = { editor?: Editor | null };

export default function TextDirectionControl({ editor }: TextDirectionControlProps) {
    const [activeDir, setActiveDir] = useState<TextDirection>(null);

    const computeActiveDir = useCallback((): TextDirection => {
        if (!editor) return null;
        if (editor.isActive({ dir: "rtl" })) return "rtl";
        if (editor.isActive({ dir: "ltr" })) return "ltr";
        return null;
    }, [editor]);

    useEffect(() => {
        if (!editor) return;
        const update = () => setActiveDir(computeActiveDir());
        update();
        editor.on("selectionUpdate", update);
        editor.on("transaction", update);
        editor.on("update", update);
        return () => {
            editor.off("selectionUpdate", update);
            editor.off("transaction", update);
            editor.off("update", update);
        };
    }, [editor, computeActiveDir]);

    const applyDirection = (dir: "ltr" | "rtl") => {
        if (!editor) return;
        const isSame = activeDir === dir;
        if (isSame) {
            editor.chain().focus().unsetTextDirection().run();
        } else {
            editor.chain().focus().setBlockTextDirection(dir).run();
        }
    };

    const disabled = !editor?.isEditable;

    return (
        <div dir="rtl" className="flex items-center gap-1 px-1">
            <Button
                type="button"
                variant={activeDir === "rtl" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => applyDirection("rtl")}
                aria-pressed={activeDir === "rtl"}
                disabled={disabled}
                title="اتجاه من اليمين إلى اليسار (RTL)"
                className="h-8"
            >

                <LtrIcon className="h-4 w-4" />
            </Button>
            <Button

                type="button"
                variant={activeDir === "ltr" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => applyDirection("ltr")}
                aria-pressed={activeDir === "ltr"}
                disabled={disabled}
                title="اتجاه من اليسار إلى اليمين (LTR)"
                className="h-8"
            >
                <RtlIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}
