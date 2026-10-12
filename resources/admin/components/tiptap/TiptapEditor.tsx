import type { AnyExtension, Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import '../../../css/tiptap.css';
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { buildEditorExtensions } from "./editorExtensions";
import EditorFooter from "./EditorFooter";
import EditorToolbar, { type ToolbarAction } from "./EditorToolbar";
import { TextDirection } from "./extension/text-direction"; // + register text-direction

// Props
type Props = {
    value?: string;
    name?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    minHeight?: number | string;
    maxHeight?: number | string | null;
    showCharacterCount?: boolean;
    showWordCount?: boolean;
    extensions?: AnyExtension[];
    toolbarActions?: ToolbarAction[];
    onReady?: (editor: Editor) => void;
    editorClassName?: string;
    toolbarClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
    changeDebounceMs?: number;
};

// debounce hook صغير
function useDebouncedCallback<T extends unknown[]>(
    fn: (...args: T) => void,
    delay = 300
) {
    const fnRef = useRef(fn);
    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    const timeoutRef = useRef<number | null>(null);

    const debounced = useCallback(
        (...args: T) => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => {
                fnRef.current(...args);
            }, delay);
        },
        [delay]
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debounced;
}

const DEFAULT_ACTIONS: ToolbarAction[] = [
    "undoRedo",
    "heading",
    "fontSize",
    "textFormat",
    "textColor",
    "backgroundColor",
    "align",
    'textDirection',
    "list",
    "link",
    // "image",
    "youtube",
    "preview",
    "fullscreen", // new
];

const TiptapEditor = forwardRef<Editor | null, Props>(function TiptapEditor(
    {
        value = "",
        name,
        onChange,
        placeholder = "ابدأ الكتابة هنا...",
        minHeight = 500,
        maxHeight = null,
        showCharacterCount = true,
        showWordCount = true,
        extensions = [],
        toolbarActions = DEFAULT_ACTIONS,
        onReady,
        editorClassName,
        toolbarClassName,
        contentClassName,
        footerClassName,
        changeDebounceMs = 300,
    },
    ref
) {
    const [wordCount, setWordCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const defaultValue = useMemo(() => "<p></p>", []); // to avoid re-creating string


    // preserve scroll position when toggling between in-page and dialog
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const scrollPosRef = useRef(0);

    const toggleFullscreen = useCallback(() => {
        const sc = scrollContainerRef.current;
        if (sc) scrollPosRef.current = sc.scrollTop;
        setIsFullscreen((prev) => !prev);
    }, []);

    const handleDialogOpenChange = useCallback((open: boolean) => {
        if (!open) {
            const sc = scrollContainerRef.current;
            if (sc) scrollPosRef.current = sc.scrollTop;
        }
        setIsFullscreen(open);
    }, []);

    useEffect(() => {
        // restore scroll after DOM has moved in/out of portal
        const id = window.requestAnimationFrame(() => {
            const sc = scrollContainerRef.current;
            if (sc != null) sc.scrollTop = scrollPosRef.current;
        });
        return () => window.cancelAnimationFrame(id);
    }, [isFullscreen]);

    const computedExtensions = useMemo(
        () =>
            buildEditorExtensions({
                enableCharacterCount: showCharacterCount || false,
                additional: [TextDirection, ...extensions], // + ensure TextDirection is included
            }),
        [showCharacterCount, extensions]
    );

    const updateCounts = useCallback((ed: Editor) => {
        const text = ed.getText().trim();
        const words = text ? text.split(/\s+/).length : 0;
        setWordCount(words);
    }, []);

    const debouncedOnChange = useDebouncedCallback((html: string) => {
        onChange?.(html);
    }, changeDebounceMs);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: computedExtensions,
        content: value,
        onCreate: ({ editor }) => {
            updateCounts(editor);
            onReady?.(editor);
        },
        onUpdate: ({ editor }) => {
            updateCounts(editor);
            debouncedOnChange(editor.getHTML());
            setCurrentHTML(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "relative", // باقي التنسيقات نمررها عبر className في EditorContent
            },
        },
    }, []);
    const [currentHTML, setCurrentHTML] = useState(editor?.getHTML() ?? value ?? defaultValue ?? "");

    // مزامنة value الخارجي فقط عند اختلاف حقيقي
    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        const next = value || "";
        if (current !== next) {
            editor.commands.setContent(next, { emitUpdate: false });
        }
    }, [value, editor]);

    // forwardRef نظيف
    useEffect(() => {
        if (!ref) return;
        if (typeof ref === "function") {
            ref(editor ?? null);
        } else {
            (ref as React.MutableRefObject<Editor | null>).current = editor ?? null;
        }
    }, [editor, ref]);

    const minHeightStyle = useMemo(() => {
        return typeof minHeight === "number" ? `${minHeight}px` : minHeight;
    }, [minHeight]);
    const contentMinHeight = useMemo(
        () => (isFullscreen ? "100%" : minHeightStyle),
        [isFullscreen, minHeightStyle]
    );

    const maxHeightStyle = useMemo(() => {
        if (maxHeight == null) return undefined;
        return typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
    }, [maxHeight]);
    const contentMaxHeight = useMemo(() => (isFullscreen ? "100%" : maxHeightStyle), [
        isFullscreen,
        maxHeightStyle,
    ]);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        scrollContainer.style.minHeight = contentMinHeight;
        scrollContainer.style.maxHeight = contentMaxHeight ?? "";
    }, [contentMinHeight, contentMaxHeight]);


    const openPreview = useCallback(() => {
        setIsPreviewOpen(true)
    }, []);



    const editorUI = (
        <Card
            className={cn(
                "w-full border-0 p-0! m-0! overflow-hidden rounded-none shadow-sm transition-all duration-200",
                editorClassName,
                isFullscreen && "h-full rounded-2xl bg-background"
            )}

        >
            <div
                className={cn(
                    "w-full h-full grid grid-rows-[auto_1fr_30px] border rounded-lg transition-all duration-200",
                    isFullscreen && "border-0 rounded-none!"
                )}
            >
                <EditorToolbar
                    editor={editor}
                    actions={toolbarActions}
                    className={toolbarClassName}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    onOpenPreview={openPreview}
                />
                <div className="relative scrollbar" ref={scrollContainerRef}>
                    <EditorContent
                        editor={editor}
                        name={name}
                        className={cn(
                            "tiptap ProseMirror relative max-w-none w-full p-5 ",
                            contentClassName
                        )}
                    />
                    {editor?.isEmpty && (
                        <div className="absolute top-8 ltr:left-5 rtl:right-5 pointer-events-none text-muted-foreground/60">
                            {placeholder}
                        </div>
                    )}
                </div>
                <EditorFooter
                    editor={editor}
                    wordCount={wordCount}
                    showCharacterCount={showCharacterCount}
                    showWordCount={showWordCount}
                    className={footerClassName}
                />
            </div>
        </Card>
    );

    return (
        <>
            {!isFullscreen && editorUI}

            <Dialog open={isFullscreen} onOpenChange={handleDialogOpenChange}>
                <DialogPortal>
                    <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
                    <DialogContent className="m-0 p-0 min-w-[95%] h-[95%] border-0 bg-background outline-none focus:outline-none">
                        <div className="hidden">
                            <DialogTitle></DialogTitle>
                            <DialogDescription></DialogDescription>
                        </div>
                        {isFullscreen && (editorUI)}
                    </DialogContent>
                </DialogPortal>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogPortal>
                    <DialogOverlay className="bg-black/10 backdrop-blur-sm" />
                    <DialogContent className="m-0 p-0 py-3 min-w-[95%] h-[95%] flex! flex-col gap-1.5 border">
                        <DialogHeader className="hidden">
                            <DialogTitle>معاينة المحتوى</DialogTitle>
                            <DialogDescription>هذه معاينة للمحتوى كما سيظهر للزوار.</DialogDescription>
                        </DialogHeader>
                        <div className="w-full h-full px-3 scrollbar">
                            <div
                                className="max-w-5xl mx-auto tiptap ProseMirror prose pt-8 pb-4"
                                dangerouslySetInnerHTML={{ __html: currentHTML }}
                            />
                        </div>
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </>
    );
});

export default TiptapEditor;
