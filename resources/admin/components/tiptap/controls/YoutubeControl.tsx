import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FaYoutube as Youtube  } from "react-icons/fa";
import type { TextAlignValue } from "@/components/tiptap/types";
import { Editor } from "@tiptap/core";
import type React from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

type Unit = "px" | "%";
type LoadingAttr = "lazy" | "eager";
// Add a proper type for referrer policy
type ReferrerPolicyAttr = React.HTMLAttributeReferrerPolicy;

type YoutubeControlProps = {
    editor?: Editor | null;
    labels?: Partial<typeof defaultLabels>;
};

// ---- i18n labels (override via props.labels) ----
const defaultLabels = {
    insertBtn: "إدراج فيديو",
    cancelBtn: "إلغاء",
    previewBtn: "معاينة",
    urlLabel: "رابط يوتيوب",
    urlHelper: "أدخل رابط YouTube صالح (watch, youtu.be, أو /embed).",
    invalidUrl: "رابط غير صالح. يرجى إدخال رابط يوتيوب صحيح.",
    widthLabel: "العرض",
    heightLabel: "الطول",
    titleLabel: "العنوان (SEO)",
    titleHelper: "خيارّي. يساعد في الوصول و SEO.",
    frameborderLabel: "Frame Border",
    loadingLabel: "Loading",
    referrerPolicyLabel: "Referrer Policy",
    alignLabel: "محاذاة",
    alignLeft: "يسار",
    alignCenter: "وسط",
    alignRight: "يمين",
    alignJustify: "مضبوط",
    autoplayLabel: "تشغيل تلقائي",
    fullscreenLabel: "السماح بملء الشاشة",
    controlsLabel: "إظهار عناصر التحكم",
    nocookieLabel: "نطاق youtube-nocookie",
};

// ---- Helpers ----
const initialState = {
    url: "",
    width: 560,
    widthUnit: "px" as Unit,
    height: 315,
    heightUnit: "px" as Unit,
    title: "",
    frameborder: "0",
    loading: "lazy" as LoadingAttr,
    referrerpolicy: "strict-origin-when-cross-origin" as ReferrerPolicyAttr,
    textAlign: "center" as TextAlignValue,
    autoplay: false,
    allowfullscreen: true,
    controls: true,
    nocookie: false,
    showPreview: false,
};

type State = typeof initialState;

type Action =
    | { type: "SET"; field: keyof State; value: any }
    | { type: "SET_MANY"; payload: Partial<State> }
    | { type: "RESET" };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET": {
            // keep % limits for width/height
            if (action.field === "widthUnit") {
                const unit = action.value as Unit;
                const width = unit === "%" && state.width > 100 ? 100 : state.width;
                return { ...state, widthUnit: unit, width };
            }
            if (action.field === "heightUnit") {
                const unit = action.value as Unit;
                const height = unit === "%" && state.height > 100 ? 100 : state.height;
                return { ...state, heightUnit: unit, height };
            }
            if (action.field === "width") {
                const v = Number(action.value || 0);
                const capped = state.widthUnit === "%" ? Math.min(v, 100) : v;
                return { ...state, width: capped };
            }
            if (action.field === "height") {
                const v = Number(action.value || 0);
                const capped = state.heightUnit === "%" ? Math.min(v, 100) : v;
                return { ...state, height: capped };
            }
            return { ...state, [action.field]: action.value };
        }
        case "SET_MANY":
            return { ...state, ...action.payload };
        case "RESET":
            return { ...initialState };
        default:
            return state;
    }
}

// Extract YouTube ID and build embed URL
function parseYoutube(url: string) {
    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, "");
        let id = "";
        if (host === "youtu.be") {
            id = u.pathname.split("/").filter(Boolean)[0] || "";
        } else if (host.includes("youtube")) {
            if (u.pathname.startsWith("/watch")) id = u.searchParams.get("v") || "";
            else if (u.pathname.startsWith("/embed/"))
                id = u.pathname.split("/").filter(Boolean)[1] || "";
            else if (u.pathname.startsWith("/shorts/"))
                id = u.pathname.split("/").filter(Boolean)[1] || "";
        }
        if (!id || !/^[a-zA-Z0-9_-]{6,}$/.test(id)) return { valid: false as const };
        return { valid: true as const, id };
    } catch {
        return { valid: false as const };
    }
}

function buildEmbedSrc(
    id: string,
    opts: Pick<State, "autoplay" | "controls" | "nocookie">
) {
    const base = opts.nocookie
        ? "https://www.youtube-nocookie.com/embed/"
        : "https://www.youtube.com/embed/";
    const qs = new URLSearchParams({
        autoplay: opts.autoplay ? "1" : "0",
        controls: opts.controls ? "1" : "0",
        rel: "0",
        modestbranding: "1",
    });
    return `${base}${id}?${qs.toString()}`;
}

// ---- Small subcomponent to reduce duplication ----
function InputWithUnit(props: {
    label: string;
    value: number;
    unit: Unit;
    onValue: (v: number) => void;
    onUnit: (u: Unit) => void;
    min?: number;
    max?: number;
    helper?: string;
}) {
    const { label, value, unit, onValue, onUnit, min = 1, max, helper } = props;
    return (
        <div className="flex-1">
            <div className="text-xs mb-1">{label}</div>
            <div className="flex gap-1 items-center">
                <Input
                    type="number"
                    value={value}
                    min={min}
                    max={unit === "%" ? 100 : max}
                    onChange={(e) => onValue(Number(e.target.value))}
                    className="w-full"
                />
                <Select value={unit} onValueChange={(val: Unit) => onUnit(val)}>
                    <SelectTrigger className="w-14 h-8 px-1 py-0 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {helper ? (
                <div className="text-[11px] text-muted-foreground mt-1">{helper}</div>
            ) : null}
        </div>
    );
}

export default function YoutubeControl({ editor, labels: labelsOverride }: YoutubeControlProps) {
    const labels = { ...defaultLabels, ...(labelsOverride || {}) };
    const [state, dispatch] = useReducer(reducer, initialState);
    const [open, setOpen] = useState<boolean>(false);

    const previewBoxRef = useRef<HTMLDivElement | null>(null);

    const { url, width, widthUnit, height, heightUnit, title, frameborder, loading, referrerpolicy, textAlign, autoplay, allowfullscreen, controls, nocookie, showPreview } =
        state;

    const parsed = useMemo(() => parseYoutube(url), [url]);
    const isValid = parsed.valid;
    const embedSrc = useMemo(
        () => (isValid ? buildEmbedSrc(parsed.id, { autoplay, controls, nocookie }) : ""),
        [isValid, parsed, autoplay, controls, nocookie]
    );

    useEffect(() => {
        const el = previewBoxRef.current;
        if (!el) return;

        el.style.width = widthUnit === "%" ? `${width}%` : "";
        el.style.height = heightUnit === "%" ? `${height}%` : "";
    }, [width, widthUnit, height, heightUnit]);

    const onInsert = () => {
        if (!editor || !isValid) return;
        editor
            .chain()
            .focus()
            .embedYoutube({
                src: embedSrc, // pass sanitized embed URL
                width,
                widthUnit,
                height,
                heightUnit,
                title,
                frameborder,
                loading,
                referrerpolicy,
                textAlign,
                autoplay,
                allowfullscreen,
                controls,
                nocookie,
            })
            .run();
        dispatch({ type: "RESET" });
        setOpen(false);
    };

    const onCancel = () => {
        dispatch({ type: "RESET" });
        setOpen(false);
    };

    const onOpenChange = (v: boolean) => {
        if (v) dispatch({ type: "RESET" });
        setOpen(v);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={labels.insertBtn}
                >
                    <Youtube className="w-5 h-5" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="w-96  max-h-dvh p-4 flex flex-col gap-3 z-50">
                <div className="h-full scrollbar">
                    {/* URL */}
                    <div>
                        <div className="text-xs mb-1">{labels.urlLabel}</div>
                        <Input
                            type="text"
                            value={url}
                            onChange={(e) => dispatch({ type: "SET", field: "url", value: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={isValid || url.length === 0 ? "" : "border-destructive"}
                        />
                        <div className={`text-[11px] mt-1 ${isValid || url.length === 0 ? "text-muted-foreground" : "text-destructive"}`}>
                            {isValid || url.length === 0 ? labels.urlHelper : labels.invalidUrl}
                        </div>
                    </div>

                    {/* Size */}
                    <div className="flex gap-2">
                        <InputWithUnit
                            label={labels.widthLabel}
                            value={width}
                            unit={widthUnit}
                            onValue={(v) => dispatch({ type: "SET", field: "width", value: v })}
                            onUnit={(u) => dispatch({ type: "SET", field: "widthUnit", value: u })}
                            helper={widthUnit === "%" ? "حتى 100%" : undefined}
                        />
                        <InputWithUnit
                            label={labels.heightLabel}
                            value={height}
                            unit={heightUnit}
                            onValue={(v) => dispatch({ type: "SET", field: "height", value: v })}
                            onUnit={(u) => dispatch({ type: "SET", field: "heightUnit", value: u })}
                            helper={heightUnit === "%" ? "حتى 100%" : undefined}
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <div className="text-xs mb-1">{labels.titleLabel}</div>
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => dispatch({ type: "SET", field: "title", value: e.target.value })}
                            placeholder="مثال: فيديو توضيحي"
                        />
                        <div className="text-[11px] text-muted-foreground mt-1">{labels.titleHelper}</div>
                    </div>

                    {/* Options row 1 */}
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <div className="text-xs mb-1">{labels.frameborderLabel}</div>
                            <Select
                                value={frameborder}
                                onValueChange={(v) => dispatch({ type: "SET", field: "frameborder", value: v })}
                            >
                                <SelectTrigger className="h-8 px-2 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">0</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className="text-xs mb-1">{labels.loadingLabel}</div>
                            <Select
                                value={loading}
                                onValueChange={(v: LoadingAttr) => dispatch({ type: "SET", field: "loading", value: v })}
                            >
                                <SelectTrigger className="h-8 px-2 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lazy">lazy</SelectItem>
                                    <SelectItem value="eager">eager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className="text-xs mb-1">{labels.referrerPolicyLabel}</div>
                            <Select
                                value={referrerpolicy}
                                onValueChange={(v: ReferrerPolicyAttr) =>
                                    dispatch({ type: "SET", field: "referrerpolicy", value: v })
                                }
                            >
                                <SelectTrigger className="h-8 px-2 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-referrer">no-referrer</SelectItem>
                                    <SelectItem value="origin">origin</SelectItem>
                                    <SelectItem value="same-origin">same-origin</SelectItem>
                                    <SelectItem value="strict-origin">strict-origin</SelectItem>
                                    <SelectItem value="strict-origin-when-cross-origin">
                                        strict-origin-when-cross-origin
                                    </SelectItem>
                                    <SelectItem value="no-referrer-when-downgrade">
                                        no-referrer-when-downgrade
                                    </SelectItem>
                                    <SelectItem value="origin-when-cross-origin">
                                        origin-when-cross-origin
                                    </SelectItem>
                                    <SelectItem value="unsafe-url">unsafe-url</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Alignment */}
                    <div className="flex gap-2 items-center">
                        <span className="text-xs">{labels.alignLabel}</span>
                        <Select
                            value={textAlign}
                            onValueChange={(v: TextAlignValue) => dispatch({ type: "SET", field: "textAlign", value: v })}
                        >
                            <SelectTrigger className="w-24 h-8 px-1 py-0 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">{labels.alignLeft}</SelectItem>
                                <SelectItem value="center">{labels.alignCenter}</SelectItem>
                                <SelectItem value="right">{labels.alignRight}</SelectItem>
                                <SelectItem value="justify">{labels.alignJustify}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Extra checkboxes */}
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={autoplay}
                                onCheckedChange={(v) => dispatch({ type: "SET", field: "autoplay", value: Boolean(v) })}
                            />
                            {labels.autoplayLabel}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={allowfullscreen}
                                onCheckedChange={(v) =>
                                    dispatch({ type: "SET", field: "allowfullscreen", value: Boolean(v) })
                                }
                            />
                            {labels.fullscreenLabel}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={controls}
                                onCheckedChange={(v) => dispatch({ type: "SET", field: "controls", value: Boolean(v) })}
                            />
                            {labels.controlsLabel}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={nocookie}
                                onCheckedChange={(v) => dispatch({ type: "SET", field: "nocookie", value: Boolean(v) })}
                            />
                            {labels.nocookieLabel}
                        </label>
                    </div>

                    {/* Preview */}
                    {showPreview && isValid ? (
                        <div className="w-full border rounded overflow-hidden">
                            <div
                                ref={previewBoxRef}
                                className="relative"
                            >
                                <iframe
                                    src={embedSrc}
                                    title={title || "YouTube video"}
                                    loading={loading}
                                    referrerPolicy={referrerpolicy}
                                    width={widthUnit === "px" ? width : undefined}
                                    height={heightUnit === "px" ? height : undefined}
                                    className="border-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen={allowfullscreen}
                                />
                            </div>
                        </div>
                    ) : null}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-2">
                        <Button
                            type="button" variant="ghost" size="sm" onClick={onCancel}>
                            {labels.cancelBtn}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => dispatch({ type: "SET", field: "showPreview", value: !showPreview })}
                            disabled={!isValid}
                        >
                            {labels.previewBtn}
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={onInsert}
                            disabled={!isValid}
                        >
                            {labels.insertBtn}
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

