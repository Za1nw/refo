import React from "react";
import { Button } from "@/components/ui/button";
import ImageCard from "./ImageCard";
import { StudioImagesTexts } from "@/hooks/useStudioImages";
import { ImageItem } from "@/types/photo";

function ImageGrid({
    isLoading,
    images,
    selectedSet,
    onToggle,
    onEmptyUploadClick,
    t,
}: {
    isLoading: boolean;
    images: ImageItem[];
    selectedSet: Set<string | number>;
    onToggle: (img: ImageItem) => void;
    onEmptyUploadClick: () => void;
    t: StudioImagesTexts;
}) {
    if (isLoading) {
        return (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 p-2 w-full flex-1 min-h-0">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-full aspect-square rounded-md overflow-hidden border bg-muted/30 animate-pulse" />
                ))}
            </div>
        );
    }
    if (!images.length) {
        return (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center gap-3 w-full flex-1 min-h-0">
                <svg width="48" height="48" viewBox="0 0 24 24" className="text-muted-foreground">
                    <path fill="currentColor" d="M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 12H4V7h16v10M8.5 11A1.5 1.5 0 1 0 7 9.5A1.5 1.5 0 0 0 8.5 11M5 17l3.5-4.5l2.5 3l3.5-4.5L19 17H5Z" />
                </svg>
                <div className="text-lg font-medium">{t.emptyTitle}</div>
                <p className="text-sm text-muted-foreground">{t.emptyDescription}</p>
                <Button onClick={onEmptyUploadClick}>{t.emptyAction}</Button>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2 w-full flex-1 min-h-0 overflow-auto">
            {images.map((img) => (
                <ImageCard
                    key={img.id}
                    image={img}
                    selected={selectedSet.has(img.id)}
                    onToggle={onToggle}
                    selectLabel={t.selectImage}
                />
            ))}
        </div>
    );
}

export default ImageGrid;
