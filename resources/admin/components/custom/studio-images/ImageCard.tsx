import React, { memo } from "react";
import OptimizedImage from "../OptimizedImage";
import { ImageItem } from "@/types/photo";

const ImageCard = memo(function ImageCard({
    image,
    selected,
    onToggle,
    selectLabel,
}: {
    image: ImageItem;
    selected: boolean;
    onToggle: (image: ImageItem) => void;
    selectLabel: string;
}) {
    return (
        <div className="relative group w-full h-full flex flex-col">
            {selected && (
                <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground p-1 rounded-full text-xs">
                    ✓
                </div>
            )}
            <button
                type="button"
                onClick={() => onToggle(image)}
                className="w-full h-full rounded-md overflow-hidden relative flex-1"
                aria-label={selectLabel}
                title={selectLabel}
            >
                <img
                    src={image.url}
                    alt={image.name ?? `Image ${image.id}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/image-placeholder.png";
                    }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
        </div>
    );
}, (prev, next) => prev.selected === next.selected && prev.image.id === next.image.id && prev.image.path === next.image.path);

export default ImageCard;
