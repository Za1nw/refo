
import { Editor, getMarkRange } from "@tiptap/core";
import { Link, ExternalLink, Unlink } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type LinkControlProps = { editor?: Editor | null };

export default function LinkControl({ editor }: LinkControlProps) {
    const [editPopoverOpen, setEditPopoverOpen] = useState<boolean>(false);
    const [currentLink, setCurrentLink] = useState<string>("");
    const [linkText, setLinkText] = useState<string>("");
    const [editUrl, setEditUrl] = useState<string>("");
    const [manualOpen, setManualOpen] = useState<boolean>(false);
    // New advanced attributes
    const [targetAttr, setTargetAttr] = useState<string>("");
    const [relAttr, setRelAttr] = useState<string>("");
    const [titleAttr, setTitleAttr] = useState<string>("");
    const [classAttr, setClassAttr] = useState<string>("");
    const [styleAttr, setStyleAttr] = useState<string>("");

    // Sentinel value to represent "no value" for Radix Select
    const NONE = "__none__";

    // Helper: get mark range of the link at current cursor
    const getCurrentLinkRange = useCallback((): { from: number; to: number } | null => {
        if (!editor) return null;
        const { from } = editor.state.selection;
        const type = editor.schema.marks.link;
        const range = getMarkRange(editor.state.doc.resolve(from), type);
        return range ?? null;
    }, [editor]);

    // Helper: compute current link state (href/text) and whether to show popover automatically
    const computeLinkState = useCallback(() => {
        if (!editor) return { href: "", text: "", show: false };
        const attrs = editor.getAttributes?.("link") ?? {};
        const { from, to, empty } = editor.state.selection;

        let show = false;
        let text = "";

        if (empty && attrs.href) {
            // Cursor inside a link
            const range = getCurrentLinkRange();
            show = !!range;
            if (range) {
                text = editor.state.doc.textBetween(range.from, range.to, " ");
            }
        } else if (!empty) {
            // Selection must be fully within a single link
            const range = getCurrentLinkRange();
            if (range && range.from <= from && range.to >= to && attrs.href) {
                show = true;
                text = editor.state.doc.textBetween(from, to, " ");
            }
        }

        if (!empty && !text) {
            text = editor.state.doc.textBetween(from, to, " ");
        }

        return {
            href: attrs.href || "",
            text,
            show,
        };
    }, [editor, getCurrentLinkRange]);

    useEffect(() => {
        if (!editor) return;
        const update = () => {
            const { href, text, show } = computeLinkState();
            const attrs = editor.getAttributes?.("link") ?? {};
            setCurrentLink(href);
            setEditUrl(href);
            if (!manualOpen) {
                setLinkText(text || href || "");
                setTargetAttr(attrs.target || "");
                setRelAttr(attrs.rel || "");
                setTitleAttr(attrs.title || "");
                setClassAttr(attrs.class || "");
                setStyleAttr(attrs.style || "");
                setEditPopoverOpen(show);
            }
        };

        // initial sync
        update();

        editor.on?.("selectionUpdate", update);
        editor.on?.("transaction", update);

        return () => {
            editor.off?.("selectionUpdate", update);
            editor.off?.("transaction", update);
        };
    }, [editor, manualOpen, computeLinkState]);

    const handleSetLink = useCallback(() => {
        if (!editor) return;

        const url = editUrl.trim();
        const desiredText = (linkText || url).toString();

        if (!url) {
            // Unset when URL is cleared
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            setEditPopoverOpen(false);
            setManualOpen(false);
            return;
        }

        // Build attributes
        const attrs: { [k: string]: string } = { href: url };
        const t = targetAttr.trim();
        const r = relAttr.trim();
        const ti = titleAttr.trim();
        const c = classAttr.trim();
        const s = styleAttr.trim();

        if (t) attrs.target = t;
        else if (/^https?:\/\//i.test(url)) attrs.target = "_blank";

        if (r) attrs.rel = r;
        else if (attrs.target === "_blank") attrs.rel = "noopener noreferrer";

        if (ti) attrs.title = ti;
        if (c) attrs.class = c;
        if (s) attrs.style = s;

        const { empty, from, to } = editor.state.selection;
        const linkRange = getCurrentLinkRange();
        const currentTextInRange = linkRange
            ? editor.state.doc.textBetween(linkRange.from, linkRange.to, " ")
            : "";

        const chain = editor.chain().focus();

        // If we are inside an existing link and text didn't change, only update attributes
        const selectionInsideLink =
            !!linkRange && (empty || (from >= linkRange.from && to <= linkRange.to));
        if (selectionInsideLink && desiredText === currentTextInRange) {
            chain.extendMarkRange("link").setLink(attrs as any).run();
        } else if (!empty) {
            // Replace current selection with new text + link
            chain
                .deleteSelection()
                .insertContent({
                    type: "text",
                    text: desiredText,
                    marks: [{ type: "link", attrs }],
                })
                .run();
        } else if (linkRange) {
            // Replace whole link range when cursor is inside link but text changed
            chain
                .setTextSelection(linkRange)
                .deleteSelection()
                .insertContent({
                    type: "text",
                    text: desiredText,
                    marks: [{ type: "link", attrs }],
                })
                .run();
        } else {
            // Insert at cursor
            chain
                .insertContent({
                    type: "text",
                    text: desiredText,
                    marks: [{ type: "link", attrs }],
                })
                .run();
        }

        setEditPopoverOpen(false);
        setManualOpen(false);
    }, [editor, editUrl, linkText, targetAttr, relAttr, titleAttr, classAttr, styleAttr, getCurrentLinkRange]);

    const handleRemoveLink = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        setEditPopoverOpen(false);
        setManualOpen(false);
    }, [editor]);

    const handleOpenExternal = useCallback(() => {
        if (editUrl) {
            window.open(editUrl, "_blank", "noopener,noreferrer");
        }
    }, [editUrl]);

    const handleOpenPopover = useCallback(() => {
        if (!editor) return;
        const { href, text } = computeLinkState();
        const attrs = editor.getAttributes?.("link") ?? {};
        setCurrentLink(href);
        setLinkText(text || href || "");
        setEditUrl(href || "");
        setTargetAttr(attrs.target || "");
        setRelAttr(attrs.rel || "");
        setTitleAttr(attrs.title || "");
        setClassAttr(attrs.class || "");
        setStyleAttr(attrs.style || "");
        setEditPopoverOpen(true);
        setManualOpen(true);
    }, [editor, computeLinkState]);

    const handlePopoverChange = useCallback((open: boolean) => {
        setEditPopoverOpen(open);
        if (!open) setManualOpen(false);
    }, []);

    return (
        <>
            {/* زر إضافة/تعديل رابط */}
            <Drawer open={editPopoverOpen} onOpenChange={handlePopoverChange}>
                <DrawerTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleOpenPopover}
                    >
                        <Link className="h-4 w-4" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="w-80 max-h-dvh p-4">
                    <div className="space-y-4">
                        {/* النص المعروض */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">النص المعروض</label>
                            <input
                                type="text"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                                aria-label="النص المعروض"
                            />
                        </div>

                        {/* الرابط */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                الرابط (URL)
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 p-0 ml-1"
                                    onClick={handleOpenExternal}
                                    disabled={!editUrl}
                                    tabIndex={-1}
                                    title="فتح الرابط في نافذة جديدة"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </label>
                            <input
                                type="url"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                                placeholder="https://example.com"
                                aria-label="الرابط"
                            />
                        </div>

                        {/* خصائص متقدمة */}
                        <div className="grid grid-cols-2 gap-2">
                            {/* target as Select */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium">target</label>
                                <Select
                                    value={targetAttr || NONE}
                                    onValueChange={(v) => setTargetAttr(v === NONE ? "" : v)}
                                >
                                    <SelectTrigger className="h-8 px-2 text-xs">
                                        <SelectValue placeholder="اختر target" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE}>(افتراضي)</SelectItem>
                                        <SelectItem value="_blank">_blank</SelectItem>
                                        <SelectItem value="_self">_self</SelectItem>
                                        <SelectItem value="_parent">_parent</SelectItem>
                                        <SelectItem value="_top">_top</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* rel as Select */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium">rel</label>
                                <Select
                                    value={relAttr || NONE}
                                    onValueChange={(v) => setRelAttr(v === NONE ? "" : v)}
                                >
                                    <SelectTrigger className="h-8 px-2 text-xs">
                                        <SelectValue placeholder="اختر rel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE}>(افتراضي)</SelectItem>
                                        <SelectItem value="noopener">noopener</SelectItem>
                                        <SelectItem value="noreferrer">noreferrer</SelectItem>
                                        <SelectItem value="nofollow">nofollow</SelectItem>
                                        <SelectItem value="noopener noreferrer">noopener noreferrer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* title input */}
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-medium">title</label>
                                <input
                                    type="text"
                                    value={titleAttr}
                                    onChange={(e) => setTitleAttr(e.target.value)}
                                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                                    placeholder="وصف اختياري"
                                    aria-label="title"
                                />
                            </div>

                            {/* class & style remain as-is if present */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium">class</label>
                                <input
                                    type="text"
                                    value={classAttr}
                                    onChange={(e) => setClassAttr(e.target.value)}
                                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                                    placeholder="btn btn-link"
                                    aria-label="class"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">style</label>
                                <input
                                    type="text"
                                    value={styleAttr}
                                    onChange={(e) => setStyleAttr(e.target.value)}
                                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                                    placeholder="color: red; text-decoration: underline;"
                                    aria-label="style"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center gap-2">
                            {/* زر حذف الرابط */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={handleRemoveLink}
                                disabled={!currentLink}
                                title="حذف الرابط"
                            >
                                <Unlink className="h-5 w-5" />
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditPopoverOpen(false);
                                        setManualOpen(false);
                                    }}
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSetLink}
                                    disabled={!editUrl}
                                >
                                    {currentLink ? "تحديث" : "إدراج"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
