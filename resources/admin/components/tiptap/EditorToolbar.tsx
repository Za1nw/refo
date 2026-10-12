import type { Editor } from "@tiptap/core";
import { EyeIcon } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

import BackgroundColorControl from "./controls/BackgroundColorControl";
import FontSizeControl from "./controls/FontSizeControl";
import HeadingControls from "./controls/HeadingControls";
// import ImageControl from "./controls/ImageControl";
import LinkControl from "./controls/LinkControl";
import ListControls from "./controls/ListControls";
import TextAlignControls from "./controls/TextAlignControls";
import TextColorControl from "./controls/TextColorControl";
import TextDirectionControl from "./controls/TextDirectionControl";
import TextFormatControls from "./controls/TextFormatControls";
import UndoRedoControls from "./controls/UndoRedoControls";
import YoutubeControl from "./controls/YoutubeControl";

export type ToolbarAction =
    | "undoRedo"
    | "heading"
    | "fontSize"
    | "textFormat"
    | "textColor"
    | "backgroundColor"
    | "align"
    | "textDirection"
    | "list"
    | "link"
    | "image"
    | "youtube"
    | "preview"
    | "fullscreen";

type Props = {
    editor: Editor | null | undefined;
    actions: ToolbarAction[];
    className?: string;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onOpenPreview?: () => void;
};

function FullscreenToggleButton({
    isFullscreen,
    onToggle,
}: {
    isFullscreen: boolean;
    onToggle: () => void;
}) {
    const label = isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة";
    return (
        <button aria-label={label}
            type="button"
            onClick={onToggle}
            title={label}
            className="px-2 h-8 inline-flex items-center gap-2 rounded hover:bg-muted transition-colors text-sm"
        >
            <span className="text-base leading-none">{isFullscreen ? "⤡" : "⤢"}</span>
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
function PreviewButton({ onOpen }: { onOpen?: () => void }) {
    const label = "معاينة";
    return (
        <button
            type="button"
            onClick={onOpen}
            title={label}
            className="px-2 h-8 inline-flex items-center gap-1 rounded hover:bg-muted transition-colors text-sm"
        >
            <span className="text-base leading-none">
                <EyeIcon size={14} />
            </span>
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

const renderAction = (
    action: ToolbarAction,
    editor: Editor | null | undefined,
    fullscreen: { isFullscreen: boolean; onToggleFullscreen: () => void },
    onOpenPreview?: () => void
) => {
    switch (action) {
        case "undoRedo":
            return <>{editor && <UndoRedoControls editor={editor} />}</>;
        case "heading":
            return <>{editor && <HeadingControls editor={editor} />}</>;
        case "fontSize":
            return <>{editor && <FontSizeControl editor={editor} />}</>;
        case "textFormat":
            return <>{editor && <TextFormatControls editor={editor} />}</>;
        case "textColor":
            return <>{editor && <TextColorControl editor={editor} />}</>;
        case "backgroundColor":
            return <>{editor && <BackgroundColorControl editor={editor} />}</>;
        case "align":
            return <>{editor && <TextAlignControls editor={editor} />}</>;
        case "textDirection":
            return <>{editor && <TextDirectionControl editor={editor} />}</>;
        case "list":
            return <>{editor && <ListControls editor={editor} />}</>;
        case "link":
            return <>{editor && <LinkControl editor={editor} />}</>;
        // case "image":
        //     return <>{editor && <ImageControl editor={editor} />}</>;
        case "youtube":
            return <>{editor && <YoutubeControl editor={editor} />}</>;
        case "preview":
            return <PreviewButton onOpen={onOpenPreview} />;
        case "fullscreen":
            return (
                <FullscreenToggleButton
                    isFullscreen={fullscreen.isFullscreen}
                    onToggle={fullscreen.onToggleFullscreen}
                />
            );
        default:
            return null;
    }

};

export default function EditorToolbar({
    editor,
    actions,
    className,
    isFullscreen,
    onToggleFullscreen,
    onOpenPreview,
}: Props) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-center gap-1 divide-x divide-border h-min p-2 rounded-t-lg sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80",
                className
            )}
        >
            {actions.map((a, idx) => (
                <React.Fragment key={`${a}-${idx}`}>
                    {renderAction(a, editor, { isFullscreen, onToggleFullscreen }, onOpenPreview)}
                </React.Fragment>
            ))}
            <div className="flex-1" />
        </div>
    );
}
