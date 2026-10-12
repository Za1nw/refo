import type { Editor as TiptapEditor } from "@tiptap/core";
import { Image as ImageIcon } from "lucide-react";
import type { Node as PMNode } from "@tiptap/pm/model";
import { NodeSelection, Selection } from "@tiptap/pm/state";
import { useCallback, useEffect, useState } from "react";

import StudioImages from "@/components/custom/studio-images/StudioImages";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { ImageItem } from "@/types/photo";

import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

// ------------------------------------------------------
// Types and small helpers
// ------------------------------------------------------
type Unit = "px" | "%";
type LoadingMode = "eager" | "lazy";
type NodeWithPos = { node: PMNode; pos: number };

function parseDim(value?: string | null): { num: string; unit: Unit } {
    if (!value) return { num: "", unit: "px" };
    const trimmed = String(value).trim();
    if (trimmed.endsWith("%")) return { num: trimmed.slice(0, -1), unit: "%" };
    if (trimmed.endsWith("px")) return { num: trimmed.slice(0, -2), unit: "px" };
    // plain number -> treat as px
    return { num: trimmed, unit: "px" };
}

function formatDim(num: string, unit: Unit): string | undefined {
    const n = (num ?? "").trim();
    if (!n) return undefined;
    return `${n}${unit}`;
}

function isImageAdvanced(node: PMNode): boolean {
    return node.type.name === "ImageAdvanced";
}

function attrsEqual(
    oldAttrs: Record<string, unknown>,
    next: { width?: string; height?: string; alt?: string; loading?: LoadingMode }
): boolean {
    const normalize = (v: unknown) => (v === null || v === undefined || v === "" ? undefined : String(v));
    return (
        normalize(oldAttrs.width) === normalize(next.width) &&
        normalize(oldAttrs.height) === normalize(next.height) &&
        normalize(oldAttrs.alt) === normalize(next.alt) &&
        normalize(oldAttrs.loading) === normalize(next.loading)
    );
}

// ------------------------------------------------------
// Small UI sub-parts
// ------------------------------------------------------
function SizeField(props: {
    label: string;
    value: string;
    unit: Unit;
    onValueChange: (v: string) => void;
    onUnitChange: (u: Unit) => void;
    placeholder?: string;
}) {
    const { label, value, unit, onValueChange, onUnitChange, placeholder } = props;
    return (
        <>
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    placeholder={placeholder}
                    min={1}
                />
                <Select value={unit} onValueChange={(v) => onUnitChange(v as Unit)}>
                    <SelectTrigger className="w-17.5">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    );
}

function LoadingField(props: {
    label: string;
    value: LoadingMode;
    onChange: (v: LoadingMode) => void;
}) {
    const { label, value, onChange } = props;
    return (
        <>
            <Label>{label}</Label>
            <Select value={value} onValueChange={(v) => onChange(v as LoadingMode)}>
                <SelectTrigger className="w-30">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="eager">عادي</SelectItem>
                    <SelectItem value="lazy">بطيء</SelectItem>
                </SelectContent>
            </Select>
        </>
    );
}

// ------------------------------------------------------
// Component
// ------------------------------------------------------
export default function ImageControl({ editor }: { editor?: TiptapEditor | null }) {
    // Studio/Dialog states
    const [showStudio, setShowStudio] = useState(false);
    const [pendingImage, setPendingImage] = useState<{ url: string; width?: string | number; height?: string | number } | null>(null);

    // Editing states (shared for popover + dialog)
    const [imgWidth, setImgWidth] = useState<string>("");
    const [imgWidthUnit, setImgWidthUnit] = useState<Unit>("px");
    const [imgHeight, setImgHeight] = useState<string>("");
    const [imgHeightUnit, setImgHeightUnit] = useState<Unit>("px");
    const [imgAlt, setImgAlt] = useState<string>("");
    const [imgLoading, setImgLoading] = useState<LoadingMode>("eager");

    // Selection + popover control
    const [showPopover, setShowPopover] = useState(false);
    const [selectedImageNode, setSelectedImageNode] = useState<NodeWithPos | null>(null);

    // Read node attrs into state
    const readFromNodeToState = useCallback((node: PMNode) => {
        type ImageAttrs = {
            width?: string | null;
            height?: string | null;
            alt?: string | null;
            loading?: LoadingMode | null;
        };
        const attrs = node.attrs as ImageAttrs;
        const { num: wNum, unit: wUnit } = parseDim(attrs.width ?? null);
        const { num: hNum, unit: hUnit } = parseDim(attrs.height ?? null);
        setImgWidth(wNum);
        setImgWidthUnit(wUnit);
        setImgHeight(hNum);
        setImgHeightUnit(hUnit);
        setImgAlt(attrs.alt ?? "");
        setImgLoading((attrs.loading ?? "eager") as LoadingMode);
    }, []);

    // Clear edit state (used when closing/cancel)
    const resetEditState = useCallback(() => {
        setImgWidth("");
        setImgWidthUnit("px");
        setImgHeight("");
        setImgHeightUnit("px");
        setImgAlt("");
        setImgLoading("eager");
    }, []);

    // Selection update -> show popover only when a single ImageAdvanced node is selected
    useEffect(() => {
        if (!editor) return;

        const handler = () => {
            const sel: Selection = editor.state.selection;
            if (sel instanceof NodeSelection && isImageAdvanced(sel.node)) {
                const node = sel.node;
                const pos = sel.from;
                const found: NodeWithPos = { node, pos };
                setSelectedImageNode(found);
                readFromNodeToState(node);
                setShowPopover(true);
            } else {
                setShowPopover(false);
                setSelectedImageNode(null);
            }
        };

        editor.on("selectionUpdate", handler);
        return () => {
            editor.off("selectionUpdate", handler);
        };
    }, [editor, readFromNodeToState]);

    // Click on DOM image -> open popover for exactly that ImageAdvanced node
    useEffect(() => {
        if (!editor) return;

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (target && target.nodeName === "IMG") {
                const pos = editor.view.posAtDOM(target, 0);
                const $pos = editor.state.doc.resolve(pos);

                const nodeAfter = $pos.nodeAfter;
                if (nodeAfter && isImageAdvanced(nodeAfter)) {
                    const hit: NodeWithPos = { node: nodeAfter, pos: $pos.pos };
                    setSelectedImageNode(hit);
                    readFromNodeToState(hit.node);
                    setShowPopover(true);
                    return;
                }

                const nodeBefore = $pos.nodeBefore;
                if (nodeBefore && isImageAdvanced(nodeBefore)) {
                    const startPos = $pos.pos - nodeBefore.nodeSize;
                    const hit: NodeWithPos = { node: nodeBefore, pos: startPos };
                    setSelectedImageNode(hit);
                    readFromNodeToState(hit.node);
                    setShowPopover(true);
                    return;
                }
            }
            setShowPopover(false);
            setSelectedImageNode(null);
        };

        editor.view.dom.addEventListener("click", handleClick);
        return () => {
            editor.view.dom.removeEventListener("click", handleClick);
        };
    }, [editor, readFromNodeToState]);

    // Update node attrs only if changed
    const updateImageAttrs = useCallback(() => {
        if (!editor || !selectedImageNode) return;

        const widthValue = formatDim(imgWidth, imgWidthUnit);
        const heightValue = formatDim(imgHeight, imgHeightUnit);
        const next = {
            width: widthValue,
            height: heightValue,
            alt: imgAlt || undefined,
            loading: imgLoading,
        };

        const current = selectedImageNode.node.attrs as Record<string, unknown>;
        if (attrsEqual(current, next)) {
            setShowPopover(false);
            return;
        }

        editor
            .chain()
            .focus()
            .command(({ tr, state }) => {
                const imageType = state.schema.nodes.ImageAdvanced;
                if (!imageType) return false;
                tr.setNodeMarkup(selectedImageNode.pos, imageType, {
                    ...current,
                    ...next,
                });
                return true;
            })
            .run();

        setShowPopover(false);
    }, [editor, selectedImageNode, imgWidth, imgWidthUnit, imgHeight, imgHeightUnit, imgAlt, imgLoading]);

    // Insert new image
    const insertImage = useCallback(
        (src: string, width: string, height: string, alt: string, loading: LoadingMode) => {
            if (!editor) return;
            const widthValue = formatDim(width, imgWidthUnit);
            const heightValue = formatDim(height, imgHeightUnit);

            editor
                .chain()
                .focus()
                .addImage({
                    src,
                    width: widthValue,
                    height: heightValue,
                    alt: alt || undefined,
                    loading,
                })
                .run();
        },
        [editor, imgWidthUnit, imgHeightUnit]
    );

    return (
        <>
            {/* زر إدراج صورة من الاستوديو + مرساة الـ Popover */}
            <Popover
                open={showPopover}
                onOpenChange={(open) => {
                    setShowPopover(open);
                    if (!open && selectedImageNode) {
                        // عند الإغلاق أو الإلغاء: إعادة قراءة قيم العقدة الحالية لإلغاء أي تعديلات غير محفوظة
                        readFromNodeToState(selectedImageNode.node);
                    }
                }}
            >
                <div className="inline-flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowStudio(true)}
                        title="إدراج صورة"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    {/* عنصر شفاف لاستخدامه كـ PopoverTrigger anchor بجانب الزر */}
                    <PopoverTrigger asChild>
                        <span aria-hidden="true" />
                    </PopoverTrigger>
                </div>

                {/* Popover لتعديل الصورة المحددة */}
                <PopoverContent
                    className="w-80 p-4 mt-2 flex justify-center"
                    align="center"
                    side="bottom"
                    sideOffset={8}
                >
                    <div className="space-y-3">
                        <SizeField
                            label="العرض"
                            value={imgWidth}
                            unit={imgWidthUnit}
                            onValueChange={setImgWidth}
                            onUnitChange={setImgWidthUnit}
                        />
                        <SizeField
                            label="الطول"
                            value={imgHeight}
                            unit={imgHeightUnit}
                            onValueChange={setImgHeight}
                            onUnitChange={setImgHeightUnit}
                        />
                        <Label>النص البديل (alt)</Label>
                        <Input
                            type="text"
                            value={imgAlt}
                            onChange={(e) => setImgAlt(e.target.value)}
                            placeholder="وصف الصورة"
                        />
                        <LoadingField
                            label="تحميل بطيء (Lazy loading)"
                            value={imgLoading}
                            onChange={setImgLoading}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (selectedImageNode) readFromNodeToState(selectedImageNode.node);
                                    setShowPopover(false);
                                }}
                            >
                                إلغاء
                            </Button>
                            <Button
                                type="button" size="sm" onClick={updateImageAttrs}>
                                حفظ
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Dialog لاختيار الطول والعرض قبل الإدراج */}
            <Dialog
                open={!!pendingImage}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingImage(null);
                        resetEditState();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إعدادات الصورة</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[70vh] scrollbar pr-2">
                        <div className="flex flex-col gap-4">
                            <SizeField
                                label="العرض"
                                value={imgWidth}
                                unit={imgWidthUnit}
                                onValueChange={setImgWidth}
                                onUnitChange={setImgWidthUnit}
                                placeholder="مثال: 300"
                            />
                            <SizeField
                                label="الطول"
                                value={imgHeight}
                                unit={imgHeightUnit}
                                onValueChange={setImgHeight}
                                onUnitChange={setImgHeightUnit}
                                placeholder="مثال: 200"
                            />
                            <Label>النص البديل (alt)</Label>
                            <Input
                                type="text"
                                value={imgAlt}
                                onChange={(e) => setImgAlt(e.target.value)}
                                placeholder="وصف الصورة"
                            />
                            <LoadingField
                                label="تحميل بطيء (Lazy loading)"
                                value={imgLoading}
                                onChange={setImgLoading}
                            />
                            {pendingImage?.url ? (
                                <img
                                    src={pendingImage.url}
                                    alt="معاينة"
                                    className="max-w-full mx-auto rounded border border-gray-200"
                                />
                            ) : null}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => {
                                if (!pendingImage?.url) return;
                                insertImage(
                                    pendingImage.url,
                                    imgWidth,
                                    imgHeight,
                                    imgAlt,
                                    imgLoading
                                );
                                setPendingImage(null);
                                resetEditState();
                            }}
                        >
                            إدراج الصورة
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setPendingImage(null);
                                resetEditState();
                            }}
                        >
                            إلغاء
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* استوديو الصور */}
            <StudioImages
                isOpen={showStudio}
                onClose={() => setShowStudio(false)}
                onImageSelect={(img: ImageItem | ImageItem[]) => {
                    setShowStudio(false);
                    const item = Array.isArray(img) ? img[0] : img;
                    if (!item) return;
                    setPendingImage(item);
                    // تهيئة القيم من أبعاد الصورة إن وجدت
                    const w = item?.width != null ? String(item.width) : "";
                    const h = item?.height != null ? String(item.height) : "";
                    setImgWidth(w);
                    setImgWidthUnit("px");
                    setImgHeight(h);
                    setImgHeightUnit("px");
                    setImgAlt("");
                    setImgLoading("eager");
                }}
            />
        </>
    );
}

export const ImageButton = ({ editor }: { editor: TiptapEditor | null }) => {
    return <ImageControl editor={editor} />;
}
