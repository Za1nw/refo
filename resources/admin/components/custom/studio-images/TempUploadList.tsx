import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { StudioImagesTexts } from "@/hooks/useStudioImages";
const TempUploadList = memo(function TempUploadList({
    files,
    onRemove,
    uploading,
    t,
}: {
    files: { id: string; name: string; size: number, file: File; }[];
    onRemove: (id: string) => void;
    uploading: boolean;
    uploadTempFiles: () => void;
    t: StudioImagesTexts;
}) {
    if (!files.length) return null;
    return (
        <div className="flex flex-col flex-1 min-h-0">
            <ul className="space-y-2 scrollbar">
                {files.map(f => (
                    <li key={f.id} className="flex items-center gap-2 border rounded px-2 py-1">
                        <img
                            src={f.file ? URL.createObjectURL(f.file) : ''}
                            alt={f.name}
                            className="w-10 h-10 object-cover rounded"
                        />
                        <span className="flex-1 truncate">{f.name}</span>
                        <span className="text-xs text-gray-500">{(f.size / 1024).toFixed(1)} KB</span>
                        <button
                            type="button"
                            className="text-red-500 px-2"
                            disabled={uploading}
                            onClick={() => onRemove(f.id)}
                        >
                            {t.tempRemove}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
});

export default TempUploadList;

