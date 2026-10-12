import { Editor } from "@tiptap/core";
import { Minus, Plus, Text } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
// Helpers
// Exported for reuse/testing.
export type SizeParts = { value: number; unit: string };

const DEFAULTS = {
    min: 8,
    max: 72,
    step: 1,
    defaultSize: 16,
    unit: "px",
};

// Parse "16px" | "1.25rem" | "14" -> { value, unit } or null if invalid
export function parseSize(input: string | null | undefined): SizeParts | null {
    if (!input) return null;
    const trimmed = String(input).trim();
    const match = /^(\d+(?:\.\d+)?)([a-z%]*)$/i.exec(trimmed);
    if (!match) return null;
    const value = Number(match[1]);
    const unit = match[2] || "px";
    if (Number.isNaN(value)) return null;
    return { value, unit };
}

// Normalize number/unit to string ("16px"), preserve provided unit if any
export function stringifySize(value: number, unit: string) {
    return `${value}${unit}`;
}

// Clamp numeric value between min and max
export function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

type FontSizeControlProps = {
    editor?: Editor | null;
    // optional, dynamic configuration
    min?: number;
    max?: number;
    step?: number;
    defaultSize?: number;
    unit?: string; // default "px"
};

export default function FontSizeControl({
    editor,
    min,
    max,
    step,
    defaultSize,
    unit,
}: FontSizeControlProps) {
    // Effective options (memoized)
    const opts = useMemo(
        () => ({
            min: min ?? DEFAULTS.min,
            max: max ?? DEFAULTS.max,
            step: step ?? DEFAULTS.step,
            defaultSize: defaultSize ?? DEFAULTS.defaultSize,
            unit: unit ?? DEFAULTS.unit,
        }),
        [min, max, step, defaultSize, unit]
    );

    // Current selection state
    const [mixed, setMixed] = useState<boolean>(false);
    const [current, setCurrent] = useState<SizeParts | null>(null);

    // Derived UI state
    const controlsDisabled = !editor || !editor.isEditable;

    // Determine current font-size across selection, stable callback
    const readSelectionSize = useCallback(() => {
        if (!editor) return;

        const { state } = editor;
        const { from, to, empty } = state.selection;

        const values = new Set<string>();
        const pushNormalizedOrDefault = (raw: string | null | undefined) => {
            const parsed = parseSize(raw ?? "");
            if (parsed) values.add(stringifySize(parsed.value, parsed.unit));
            else values.add(stringifySize(opts.defaultSize, opts.unit));
        };

        if (empty) {
            // Prefer storedMarks at caret (pending mark), then active attributes
            const stored = state.storedMarks?.find((m) => m.type.name === "textStyle")
                ?.attrs?.fontSize as string | undefined;
            if (stored) pushNormalizedOrDefault(stored);
            else {
                const attr = editor.getAttributes?.("textStyle")?.fontSize as string | undefined;
                if (attr) pushNormalizedOrDefault(attr);
                else pushNormalizedOrDefault(null);
            }
        } else {
            // Range: collect sizes on text nodes
            state.doc.nodesBetween(from, to, (node) => {
                if (!node.isText) return;
                const mark = node.marks.find((m) => m.type.name === "textStyle");
                const attr = (mark?.attrs?.fontSize as string | undefined) ?? null;
                pushNormalizedOrDefault(attr);
            });
        }

        if (values.size === 1) {
            const only = Array.from(values)[0]!;
            const parsed = parseSize(only);
            setMixed(false);
            setCurrent(parsed);
        } else {
            // Mixed selection
            setMixed(true);
            setCurrent(null);
        }
    }, [editor, opts.defaultSize, opts.unit]);

    useEffect(() => {
        if (!editor) return;
        editor.on?.("selectionUpdate", readSelectionSize);
        editor.on?.("transaction", readSelectionSize);
        // Initialize once
        readSelectionSize();
        return () => {
            editor.off?.("selectionUpdate", readSelectionSize);
            editor.off?.("transaction", readSelectionSize);
        };
    }, [editor, readSelectionSize]);

    // Apply change to the selection, preserving unit if available
    const applyChange = useCallback(
        (op: "increase" | "decrease" | "reset") => {
            if (!editor || !editor.isEditable) return;

            // Reset => remove mark entirely (fallback to CSS default)
            if (op === "reset") {
                // Avoid unnecessary calls when nothing to unset and not mixed
                const currentAttr = editor.getAttributes?.("textStyle")?.fontSize as
                    | string
                    | undefined;
                if (!mixed && !currentAttr) return;
                editor.chain().focus().unsetFontSize().run();
                setMixed(false);
                setCurrent(null);
                return;
            }

            const base = current?.value ?? opts.defaultSize;
            const baseUnit = current?.unit ?? opts.unit;

            const delta = op === "increase" ? opts.step : -opts.step;
            const next = clamp(base + delta, opts.min, opts.max);
            const nextStr = stringifySize(next, baseUnit);

            // If uniform and unchanged, skip
            if (!mixed) {
                const attr = editor.getAttributes?.("textStyle")?.fontSize as string | undefined;
                const parsed = parseSize(attr ?? "");
                const currentStr = parsed
                    ? stringifySize(parsed.value, parsed.unit)
                    : stringifySize(opts.defaultSize, opts.unit);
                if (currentStr === nextStr) return;
            }

            editor.chain().focus().setFontSize(nextStr).run();
            setMixed(false);
            setCurrent({ value: next, unit: baseUnit });
        },
        [editor, mixed, current, opts.min, opts.max, opts.step, opts.defaultSize, opts.unit]
    );

    // UI helpers
    const displayText = mixed
        ? "—"
        : (() => {
              const val = current?.value ?? opts.defaultSize;
              const un = current?.unit ?? opts.unit;
              return `${val}${un}`;
          })();

    const disableDec = !mixed && (current?.value ?? opts.defaultSize) <= opts.min;
    const disableInc = !mixed && (current?.value ?? opts.defaultSize) >= opts.max;

    return (
        <div className="flex w-auto h-10.5 items-center gap-1 border rounded-md bg-background">
            {/* Decrease */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer hover:bg-background"
                onClick={() => applyChange("decrease")}
                disabled={controlsDisabled || disableDec}
                aria-label="Decrease font size"
                title="Decrease font size"
            >
                <Minus className="h-4 w-4" />
            </Button>

            {/* Current value (supports mixed selection) */}
            <div className="flex items-center justify-center w-14">
                <span className="text-xs font-medium">{displayText}</span>
            </div>

            {/* Increase */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer hover:bg-background"
                onClick={() => applyChange("increase")}
                disabled={controlsDisabled || disableInc}
                aria-label="Increase font size"
                title="Increase font size"
            >
                <Plus className="h-4 w-4" />
            </Button>

            {/* Reset */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer hover:bg-background"
                onClick={() => applyChange("reset")}
                title="Reset font size"
                aria-label="Reset font size"
                disabled={controlsDisabled}
            >
                <Text className="h-4 w-4" />
            </Button>
        </div>
    );
}


export const FontSizeButton = ({ editor }: { editor: Editor | null }) => {
    return <FontSizeControl editor={editor} />;
};
