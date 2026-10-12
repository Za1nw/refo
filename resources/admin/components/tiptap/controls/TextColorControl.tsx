import type { Editor } from "@tiptap/core";
import { ChevronDown, Palette } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const COLOR_PRESETS = [
    "#000000", // أسود
    "#FFFFFF", // أبيض
    "#FF0000", // أحمر
    "#00FF00", // أخضر
    "#0000FF", // أزرق
    "#FFFF00", // أصفر
    "#FF00FF", // وردي
    "#00FFFF", // سماوي
    "#FFA500", // برتقالي
    "#A52A2A", // بني
];

type TextColorControlProps = { editor?: Editor | null };

export default function TextColorControl({ editor }: TextColorControlProps) {
    const [customColor, setCustomColor] = useState<string>("#000000");
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Track active color from TipTap to update UI immediately on selection changes.
    const [activeColor, setActiveColor] = useState<string>("");
    useEffect(() => {
        if (!editor) return;
        const update = () => {
            const c = (editor.getAttributes("textStyle")?.color as string) || "";
            setActiveColor(c);
        };
        update();
        // Subscribe
        editor.on("update", update);
        editor.on("selectionUpdate", update);
        // Cleanup with .off using the same handler
        return () => {
            editor.off("update", update);
            editor.off("selectionUpdate", update);
        };
    }, [editor]);

    const normalize = (c?: string) => (c || "").trim().toLowerCase();
    const isSameColor = (a?: string, b?: string) => normalize(a) === normalize(b);

    const applyColor = (color: string) => {
        if (!editor) return;
        editor.chain().focus().setColor(color).run();
        setIsOpen(false);
    };

    const resetColor = () => {
        if (!editor) return;
        editor.chain().focus().unsetColor().run();
        setCustomColor("#000000");
        // reset manual inputs
        setColorMode("hex");
        setHexValue("#000000");
        setNameValue("");
        setRgbValue([0, 0, 0]);
        setRgbaValue([0, 0, 0, 1]);
        setHslValue([0, 0, 0]);
        setHslaValue([0, 0, 0, 1]);
        setIsOpen(false);
    };

    // A11y: keyboard navigation within the presets grid (6 columns).
    const COLS = 6;
    const presetBtnsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const handlePresetKeyDown = (idx: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
        const max = COLOR_PRESETS.length - 1;
        const clamp = (n: number) => Math.max(0, Math.min(max, n));
        let next = idx;
        switch (e.key) {
            case "ArrowRight": next = clamp(idx + 1); break;
            case "ArrowLeft":  next = clamp(idx - 1); break;
            case "ArrowDown":  next = clamp(idx + COLS); break;
            case "ArrowUp":    next = clamp(idx - COLS); break;
            case "Enter":
            case " ": {
                e.preventDefault();
                applyColor(COLOR_PRESETS[idx]);
                return;
            }
            default: return;
        }
        e.preventDefault();
        presetBtnsRef.current[next]?.focus();
    };

    // --- Manual color entry state ---
    type Mode = "hex" | "rgb" | "rgba" | "hsl" | "hsla" | "name";
    const [colorMode, setColorMode] = useState<Mode>("hex");
    const [nameValue, setNameValue] = useState("");
    const [hexValue, setHexValue] = useState("#000000");
    const [rgbValue, setRgbValue] = useState<[number, number, number]>([0, 0, 0]);
    const [rgbaValue, setRgbaValue] = useState<[number, number, number, number]>([0, 0, 0, 1]);
    const [hslValue, setHslValue] = useState<[number, number, number]>([0, 0, 0]);
    const [hslaValue, setHslaValue] = useState<[number, number, number, number]>([0, 0, 0, 1]);

    // --- Helpers for manual validation/building ---
    const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    const RGB_RE = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i;
    const HSL_RE = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i;
    const NAME_RE = /^[a-zA-Z]+$/;

    const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

    const buildManualColor = (): { value: string | null; preview?: string } => {
        switch (colorMode) {
            case "name": {
                const v = nameValue.trim();
                return NAME_RE.test(v) ? { value: v } : { value: null };
            }
            case "hex": {
                let v = hexValue.trim();
                if (v && v[0] !== "#") v = `#${v}`;
                return HEX_RE.test(v) ? { value: v.toUpperCase() } : { value: null };
            }
            case "rgb": {
                const [r, g, b] = rgbValue.map((x) => clamp(Math.round(Number(x) || 0), 0, 255)) as [number, number, number];
                return { value: `rgb(${r}, ${g}, ${b})` };
            }
            case "rgba": {
                const [r, g, b, a] = [
                    clamp(Math.round(Number(rgbaValue[0]) || 0), 0, 255),
                    clamp(Math.round(Number(rgbaValue[1]) || 0), 0, 255),
                    clamp(Math.round(Number(rgbaValue[2]) || 0), 0, 255),
                    clamp(Number(rgbaValue[3]) || 0, 0, 1),
                ] as [number, number, number, number];
                return { value: `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})` };
            }
            case "hsl": {
                const [h, s, l] = [
                    clamp(Math.round(Number(hslValue[0]) || 0), 0, 360),
                    clamp(Math.round(Number(hslValue[1]) || 0), 0, 100),
                    clamp(Math.round(Number(hslValue[2]) || 0), 0, 100),
                ] as [number, number, number];
                return { value: `hsl(${h}, ${s}%, ${l}%)` };
            }
            case "hsla": {
                const [h, s, l, a] = [
                    clamp(Math.round(Number(hslaValue[0]) || 0), 0, 360),
                    clamp(Math.round(Number(hslaValue[1]) || 0), 0, 100),
                    clamp(Math.round(Number(hslaValue[2]) || 0), 0, 100),
                    clamp(Number(hslaValue[3]) || 0, 0, 1),
                ] as [number, number, number, number];
                return { value: `hsla(${h}, ${s}%, ${l}%, ${Number(a.toFixed(2))})` };
            }
            default:
                return { value: null };
        }
    };

    // Parse current active color to initialize manual inputs and mode
    const initManualFromActive = (color: string) => {
        const c = color?.trim() || "";
        if (!c) {
            setColorMode("hex");
            setHexValue("#000000");
            setNameValue("");
            setRgbValue([0, 0, 0]);
            setRgbaValue([0, 0, 0, 1]);
            setHslValue([0, 0, 0]);
            setHslaValue([0, 0, 0, 1]);
            return;
        }
        if (HEX_RE.test(c)) {
            setColorMode("hex");
            setHexValue(c.toUpperCase());
            return;
        }
        const mRgb = c.match(RGB_RE);
        if (mRgb) {
            const r = clamp(parseInt(mRgb[1], 10), 0, 255);
            const g = clamp(parseInt(mRgb[2], 10), 0, 255);
            const b = clamp(parseInt(mRgb[3], 10), 0, 255);
            const a = mRgb[4] !== undefined ? clamp(parseFloat(mRgb[4]), 0, 1) : undefined;
            if (a === undefined) {
                setColorMode("rgb");
                setRgbValue([r, g, b]);
            } else {
                setColorMode("rgba");
                setRgbaValue([r, g, b, a]);
            }
            return;
        }
        const mHsl = c.match(HSL_RE);
        if (mHsl) {
            const h = clamp(parseInt(mHsl[1], 10), 0, 360);
            const s = clamp(parseInt(mHsl[2], 10), 0, 100);
            const l = clamp(parseInt(mHsl[3], 10), 0, 100);
            const a = mHsl[4] !== undefined ? clamp(parseFloat(mHsl[4]), 0, 1) : undefined;
            if (a === undefined) {
                setColorMode("hsl");
                setHslValue([h, s, l]);
            } else {
                setColorMode("hsla");
                setHslaValue([h, s, l, a]);
            }
            return;
        }
        if (NAME_RE.test(c)) {
            setColorMode("name");
            setNameValue(c);
            return;
        }
        // Fallback
        setColorMode("hex");
        setHexValue("#000000");
    };

    // Initialize picker + manual inputs when opening
    return (
        <Popover
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (open) {
                    // Initialize picker with the current text color when opening
                    setCustomColor(activeColor || "#000000");
                    initManualFromActive(activeColor || "");
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!editor}
                    className="rounded-none flex items-center gap-2 px-2"
                    aria-label="ألوان النص"
                    title="ألوان النص"
                    aria-expanded={isOpen}
                >
                    <Palette className="h-4 w-4" />
                    <span className="h-3.5 w-3.5 rounded-sm border border-muted overflow-hidden" aria-hidden>
                        <svg viewBox="0 0 10 10" className="h-full w-full" focusable="false" aria-hidden="true">
                            <rect width="10" height="10" fill={activeColor || "#000000"} />
                        </svg>
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-3 space-y-2"
                align="start"
            >
                {/* Preset colors */}
                <p className="sr-only" id="preset-colors-label">ألوان جاهزة</p>
                <div
                    className="grid grid-cols-6 gap-2"
                    aria-labelledby="preset-colors-label"
                >
                    {COLOR_PRESETS.map((color, idx) => {
                        const selected = isSameColor(activeColor, color);
                        // Roving tabindex: selected (or first) is tabbable
                        const tabbable =
                            selected || (!activeColor && idx === 0);
                        return (
                            <button
                                key={color}
                                ref={(el) => {
                                    presetBtnsRef.current[idx] = el;
                                }}
                                type="button"
                                tabIndex={tabbable ? 0 : -1}
                                className={`h-7 w-7 rounded-full border p-0 flex items-center justify-center transition
                                            focus:outline-none focus:ring-2 focus:ring-ring
                                            ${selected ? "ring-2 ring-ring border-transparent" : "border-muted hover:border-foreground/40"}`}
                                onClick={() => applyColor(color)}
                                onKeyDown={handlePresetKeyDown(idx)}
                                title={`لون ${color}`}
                                aria-label={`لون ${color}`}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                                    <circle cx="10" cy="10" r="9" fill={color} />
                                </svg>
                            </button>
                        );
                    })}
                </div>

                {/* Manual color input */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label htmlFor="color-mode" className="text-xs text-muted-foreground">
                            نوع اللون
                        </label>
                        <select
                            id="color-mode"
                            className="h-8 rounded border border-input bg-background px-2 text-sm"
                            value={colorMode}
                            onChange={(e) => setColorMode(e.target.value as Mode)}
                            aria-label="حدد نوع اللون"
                        >
                            <option value="hex">HEX</option>
                            <option value="rgb">RGB</option>
                            <option value="rgba">RGBA</option>
                            <option value="hsl">HSL</option>
                            <option value="hsla">HSLA</option>
                            <option value="name">اسم اللون</option>
                        </select>

                        {/* Live preview for manual input (when valid) */}
                        {(() => {
                            const built = buildManualColor();
                            return (
                                <span className="ml-auto h-5 w-5 rounded border border-muted overflow-hidden" aria-hidden title="معاينة اللون">
                                    <svg viewBox="0 0 10 10" className="h-full w-full" focusable="false" aria-hidden="true">
                                        <rect width="10" height="10" fill={built.value ?? "transparent"} />
                                    </svg>
                                </span>
                            );
                        })()}
                    </div>

                    {/* Dynamic inputs based on selected mode */}
                    {colorMode === "hex" && (
                        <div className="flex flex-wrap items-center gap-2">
                            <label htmlFor="hex-input" className="sr-only">قيمة HEX</label>
                            <input
                                id="hex-input"
                                type="text"
                                inputMode="text"
                                className="flex-1 h-8 rounded border border-input bg-background px-2 text-sm font-mono"
                                placeholder="#000000"
                                value={hexValue}
                                onChange={(e) => setHexValue(e.target.value)}
                                aria-label="أدخل قيمة HEX"
                            />
                            <Button
                                type="button"
                                size="sm"
                                className="px-3 basis-full sm:basis-auto w-full sm:w-auto sm:ml-auto"
                                onClick={() => {
                                    const v = buildManualColor().value;
                                    if (v) applyColor(v);
                                }}
                                disabled={!buildManualColor().value}
                                aria-label="تطبيق اللون المدخل يدويًا"
                            >
                                تطبيق
                            </Button>
                        </div>
                    )}

                    {colorMode === "name" && (
                        <div className="flex flex-wrap items-center gap-2">
                            <label htmlFor="name-input" className="sr-only">اسم اللون</label>
                            <input
                                id="name-input"
                                type="text"
                                className="flex-1 h-8 rounded border border-input bg-background px-2 text-sm"
                                placeholder="red"
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                aria-label="اكتب اسم اللون"
                            />
                            <Button
                                type="button"
                                size="sm"
                                className="px-3 basis-full sm:basis-auto w-full sm:w-auto sm:ml-auto"
                                onClick={() => {
                                    const v = buildManualColor().value;
                                    if (v) applyColor(v);
                                }}
                                disabled={!buildManualColor().value}
                                aria-label="تطبيق اللون المدخل يدويًا"
                            >
                                تطبيق
                            </Button>
                        </div>
                    )}

                    {colorMode === "rgb" && (
                        <div className="flex flex-wrap items-center gap-2">
                            {["R", "G", "B"].map((lbl, i) => (
                                <div key={lbl} className="flex items-center gap-1 shrink-0">
                                    <label className="sr-only">{lbl}</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={255}
                                        className="w-14 h-8 rounded border border-input bg-background px-2 text-sm font-mono"
                                        value={rgbValue[i]}
                                        onChange={(e) => {
                                            const v = [...rgbValue] as [number, number, number];
                                            v[i] = clamp(Number(e.target.value || 0), 0, 255);
                                            setRgbValue(v);
                                        }}
                                        aria-label={`قيمة ${lbl}`}
                                    />
                                </div>
                            ))}
                            <Button
                                type="button"
                                size="sm"
                                className="px-3 basis-full sm:basis-auto w-full sm:w-auto sm:ml-auto"
                                onClick={() => applyColor(buildManualColor().value!)}
                                aria-label="تطبيق لون RGB"
                            >
                                تطبيق
                            </Button>
                        </div>
                    )}

                    {colorMode === "rgba" && (
                        <div className="flex flex-wrap items-center gap-2">
                            {["R", "G", "B"].map((lbl, i) => (
                                <div key={lbl} className="flex items-center gap-1 shrink-0">
                                    <label className="sr-only">{lbl}</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={255}
                                        className="w-14 h-8 rounded border border-input bg-background px-2 text-sm font-mono"
                                        value={rgbaValue[i]}
                                        onChange={(e) => {
                                            const v = [...rgbaValue] as [number, number, number, number];
                                            v[i] = clamp(Number(e.target.value || 0), 0, 255);
                                            setRgbaValue(v);
                                        }}
                                        aria-label={`قيمة ${lbl}`}
                                    />
                                </div>
                            ))}
                            <div className="flex items-center gap-1 shrink-0">
                                <label className="sr-only">Alpha</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    className="w-16 h-8 rounded border border-input bg-background px-2 text-sm font-mono"
                                    value={rgbaValue[3]}
                                    onChange={(e) => {
                                        const v = [...rgbaValue] as [number, number, number, number];
                                        v[3] = clamp(Number(e.target.value || 0), 0, 1);
                                        setRgbaValue(v);
                                    }}
                                    aria-label="قيمة الشفافية"
                                />
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                className="px-3 basis-full sm:basis-auto w-full sm:w-auto sm:ml-auto"
                                onClick={() => applyColor(buildManualColor().value!)}
                                aria-label="تطبيق لون RGBA"
                            >
                                تطبيق
                            </Button>
                        </div>
                    )}

                    {colorMode === "hsl" && (
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { lbl: "H", min: 0, max: 360, idx: 0 },
                                { lbl: "S", min: 0, max: 100, idx: 1 },
                                { lbl: "L", min: 0, max: 100, idx: 2 },
                            ].map(({ lbl, min, max, idx }) => (
                                <div key={lbl} className="flex items-center gap-1 shrink-0">
                                    <label className="sr-only">{lbl}</label>
                                    <input
                                        type="number"
                                        min={min}
                                        max={max}
                                        className="w-14 h-8 rounded border border-input bg-background px-2 text-sm font-mono"
                                        value={hslValue[idx]}
                                        onChange={(e) => {
                                            const v = [...hslValue] as [number, number, number];
                                            v[idx] = clamp(Number(e.target.value || 0), min, max);
                                            setHslValue(v);
                                        }}
                                        aria-label={`قيمة ${lbl}`}
                                    />
                                </div>
                            ))}
                            <Button
                                type="button"
                                size="sm"
                                className="px-3 basis-full sm:basis-auto w-full sm:w-auto sm:ml-auto"
                                onClick={() => applyColor(buildManualColor().value!)}
                                aria-label="تطبيق لون HSL"
                            >
                                تطبيق
                            </Button>
                        </div>
                    )}

                    {colorMode === "hsla" && (
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { lbl: "H", min: 0, max: 360, idx: 0 },
                                { lbl: "S", min: 0, max: 100, idx: 1 },
                                { lbl: "L", min: 0, max: 100, idx: 2 },
                            ].map(({ lbl, min, max, idx }) => (
                                <div key={lbl} className="flex items-center gap-1 shrink-0">
                                    <label className="sr-only">{lbl}</label>
                                    <input
                                        type="number"
                                        min={min}
                                        max={max}
                                        className="w-14 h-8 rounded border border-input bg-background px-2 text-sm font-mono"
                                        value={hslaValue[idx]}
                                        onChange={(e) => {
                                            const v = [...hslaValue] as [number, number, number, number];
                                            v[idx] = clamp(Number(e.target.value || 0), min, max);
                                            setHslaValue(v);
                                        }}
                                        aria-label={`قيمة ${lbl}`}
                                    />
                                </div>
                            ))}
                            <div className="flex items-center gap-1 shrink-0">
                                <label className="sr-only">Alpha</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    className="w-16 h-8 rounded border border-input bg-background px-2 text-sm font-mono"
                                    value={hslaValue[3]}
                                    onChange={(e) => {
                                        const v = [...hslaValue] as [number, number, number, number];
                                        v[3] = clamp(Number(e.target.value || 0), 0, 1);
                                        setHslaValue(v);
                                    }}
                                    aria-label="قيمة الشفافية"
                                />
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                className="px-3 basis-full sm:basis-auto w-full sm:w-auto sm:ml-auto"
                                onClick={() => applyColor(buildManualColor().value!)}
                                aria-label="تطبيق لون HSLA"
                            >
                                تطبيق
                            </Button>
                        </div>
                    )}
                </div>

                {/* Custom color picker */}
                <div className="space-y-3">
                    <HexColorPicker
                        color={customColor}
                        onChange={setCustomColor}
                        className="w-full!"
                        aria-label="منتقي لون مخصص"
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded border border-muted overflow-hidden" aria-hidden title={`اللون الحالي ${customColor}`}>
                                <svg viewBox="0 0 10 10" className="h-full w-full" focusable="false" aria-hidden="true">
                                    <rect width="10" height="10" fill={customColor} />
                                </svg>
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">{customColor.toUpperCase()}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                className="px-3"
                                onClick={() => applyColor(customColor)}
                                aria-label="تطبيق اللون المحدد"
                            >
                                تطبيق
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="px-3"
                                onClick={resetColor}
                                aria-label="إعادة اللون الافتراضي"
                            >
                                إعادة
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

