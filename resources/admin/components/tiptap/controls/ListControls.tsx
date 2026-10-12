import { Editor } from "@tiptap/core";
import { List, ListOrdered, ChevronDown, IndentIncrease, IndentDecrease } from "lucide-react";
import { JSX, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ListExtended from "../extensions/listExtended";
import type { ListExtendedType } from "../extensions/listExtended";

type ListControlsProps = { editor?: Editor | null };

export default function ListControls({ editor }: ListControlsProps) {
    if (!editor) return null;

    const hasListExtended = useMemo(
        () =>
            !!editor.extensionManager.extensions.find((e) => e.name === ListExtended.name) ||
            !!editor.schema.nodes.symbolList,
        [editor]
    );

    // Helpers
    const getActiveSymbol = (): string | null => {
        const attrs = editor.getAttributes("symbolList");
        return attrs?.symbol ?? null;
    };

    const symbolToLabel = (s: string) => {
        switch (s) {
            case "✔": return "قائمة بعلامة صح";
            case "★": return "قائمة بعلامة نجمة";
            case "–": return "قائمة بعلامة شرطة";
            case "▣": return "قائمة بعلامة مربع";
            default: return `قائمة مخصصة (${s})`;
        }
    };

    // Defer execution to avoid transaction mismatch while the dropdown is closing
    const deferAndRun = (fn: () => void) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (!editor || editor.isDestroyed) return;
                // Avoid forcing focus here; chains already call focus()
                fn();
            });
        });
    };

    // Control dropdown open state to close it before running editor commands
    const [menuOpen, setMenuOpen] = useState(false);

    // Helper to safely toggle without nested chain or racing focus changes
    const runToggle = (type: ListExtendedType) => {
        if (!hasListExtended) return;
        // Close menu first to avoid race between Radix focus/teardown and editor transactions
        setMenuOpen(false);
        // Run on next tick after menu closes
        setTimeout(() => {
            if (!editor || editor.isDestroyed) return;
            editor.commands.toggleListType(type);
        }, 0);
    };

    const LIST_TYPES = [
        {
            icon: <List className="h-4 w-4" />,
            type: "bullet",
            label: "قائمة نقطية",
            tooltip: "قائمة نقطية",
            shortcut: "Ctrl+Shift+1",
            command: () => runToggle("bullet"),
            isActive: () => editor.isActive("bulletList"),
        },
        {
            icon: <ListOrdered className="h-4 w-4" />,
            type: "ordered",
            label: "قائمة مرقمة",
            tooltip: "قائمة مرقمة",
            shortcut: "Ctrl+Shift+2",
            command: () => runToggle("ordered"),
            isActive: () => editor.isActive("orderedList"),
        },
        {
            // show the actual symbol
            icon: <span className="inline-block w-4 text-center">✔</span> as unknown as JSX.Element,
            type: "check",
            label: "قائمة بعلامة صح",
            tooltip: "قائمة بعلامة صح",
            shortcut: "Ctrl+Shift+3",
            command: () => runToggle("check"),
            isActive: () => editor.isActive("symbolList", { symbol: "✔" }),
        },
        {
            icon: <span className="inline-block w-4 text-center">★</span> as unknown as JSX.Element,
            type: "star",
            label: "قائمة بعلامة نجمة",
            tooltip: "قائمة بعلامة نجمة",
            shortcut: "Ctrl+Shift+4",
            command: () => runToggle("star"),
            isActive: () => editor.isActive("symbolList", { symbol: "★" }),
        },
        {
            icon: <span className="inline-block w-4 text-center">–</span> as unknown as JSX.Element,
            type: "dash",
            label: "قائمة بعلامة شرطة",
            tooltip: "قائمة بعلامة شرطة",
            shortcut: "Ctrl+Shift+5",
            command: () => runToggle("dash"),
            isActive: () => editor.isActive("symbolList", { symbol: "–" }),
        },
        {
            icon: <span className="inline-block w-4 text-center">▣</span> as unknown as JSX.Element,
            type: "square",
            label: "قائمة بعلامة مربع",
            tooltip: "قائمة بعلامة مربع",
            shortcut: "Ctrl+Shift+6",
            command: () => runToggle("square"),
            isActive: () => editor.isActive("symbolList", { symbol: "▣" }),
        },
        {
            icon: <span className="inline-block w-4 text-center">•</span> as unknown as JSX.Element,
            type: "custom",
            label: "قائمة مخصصة...",
            tooltip: "اختر رمزًا مخصصًا",
            shortcut: "Ctrl+Shift+7",
            command: () => {
                if (!hasListExtended) return;
                const input = typeof window !== "undefined"
                    ? window.prompt("أدخل الرمز المخصص للقائمة (حرف واحد أو أكثر):", getActiveSymbol() ?? "•")
                    : null;
                if (!input) return;
                const sym = input.trim();
                if (!sym) return;
                runToggle(`custom:${sym}`);
            },
            isActive: () => {
                const active = editor.isActive("symbolList");
                if (!active) return false;
                const s = getActiveSymbol();
                return !!s && !["✔", "★", "–", "▣"].includes(s);
            },
        },
    ] as {
        icon: JSX.Element;
        type: ListExtendedType;
        label: string;
        tooltip: string;
        shortcut?: string;
        command: () => void;
        isActive: () => boolean;
    }[];

    // Compute current label/icon (include live symbol for symbol lists)
    const getActiveDisplay = (): { icon: JSX.Element; label: string } => {
        if (editor.isActive("symbolList")) {
            const sym = getActiveSymbol() ?? "•";
            const label = symbolToLabel(sym);
            return { icon: <span className="inline-block w-4 text-center">{sym}</span> as unknown as JSX.Element, label };
        }
        const item = LIST_TYPES.find((i) => i.isActive());
        if (item) return { icon: item.icon, label: item.label };
        return { icon: <List className="h-4 w-4" />, label: "قوائم" };
    };

    const [activeDisplay, setActiveDisplay] = useState<{ icon: JSX.Element; label: string }>(getActiveDisplay);

    useEffect(() => {
        if (!editor) return;
        const update = () => setActiveDisplay(getActiveDisplay());
        editor.on("selectionUpdate", update);
        editor.on("update", update);
        return () => {
            editor.off("selectionUpdate", update);
            editor.off("update", update);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, hasListExtended]);

    // Indent / Outdent (call direct commands, not chain)
    const canIndent = () => !!hasListExtended && !!(editor.can().sinkListItem?.("listItem"));
    const canOutdent = () => !!hasListExtended && !!(editor.can().liftListItem?.("listItem"));

    const indent = () => {
        if (!hasListExtended) return;
        deferAndRun(() => editor.commands.indentList());
    };

    const outdent = () => {
        if (!hasListExtended) return;
        deferAndRun(() => editor.commands.outdentList());
    };

    const currentIcon = activeDisplay.icon;
    const currentLabel = activeDisplay.label;

    return (
        <div className="flex items-center gap-1">
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 rounded-none flex items-center gap-2 px-2"
                        title={currentLabel}
                    >
                        {currentIcon}
                        <span className="text-xs sm:text-sm">{currentLabel}</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={4} className="min-w-60">
                    {LIST_TYPES.map((item) => (
                        <DropdownMenuItem
                            key={item.type}
                            // Prevent item from stealing focus (keeps selection stable)
                            onPointerDown={(e) => e.preventDefault()}
                            // Prevent Radix's default close; we close manually to schedule the command safely
                            onSelect={(e) => {
                                e.preventDefault();
                                item.command();
                            }}
                            disabled={!hasListExtended}
                            className={`flex items-center gap-2 pr-2 leading-none ${item.isActive() ? "bg-accent" : ""}`}
                            title={item.tooltip}
                        >
                            <span className="mr-1">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {item.shortcut && (
                                <span className="ml-auto text-[10px] opacity-60 ltr:tracking-wider">{item.shortcut}</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Standalone Indent / Outdent */}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 rounded-none px-2"
                // Prevent button from stealing focus
                onMouseDown={(e) => e.preventDefault()}
                onClick={indent}
                disabled={!canIndent()}
                title="زيادة المسافة البادئة (Tab / Ctrl+])"
            >
                <IndentIncrease className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 rounded-none px-2"
                // Prevent button from stealing focus
                onMouseDown={(e) => e.preventDefault()}
                onClick={outdent}
                disabled={!canOutdent()}
                title="تقليل المسافة البادئة (Shift+Tab / Ctrl+[)"
            >
                <IndentDecrease className="h-4 w-4" />
            </Button>
        </div>
    );
}
