import React, { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import TempUploadList from "./TempUploadList";
import { StudioImagesTexts } from "@/hooks/useStudioImages";

function UploadSection ({
    uploading,
    tempFiles,
    addTempFiles,
    removeTempFile,
    uploadTempFiles,
    dragOver,
    setDragOver,
    t,
}: {
    isMulti: boolean;
    uploading: boolean;
    uploadError: string | null;
    uploadSuccessCount: number;
    tempFiles: { id: string; name: string; size: number,  file: File }[];
    addTempFiles: (files: File[]) => void;
    removeTempFile: (id: string) => void;
    uploadTempFiles: () => void;
    dragOver: boolean;
    setDragOver: (v: boolean) => void;
    t: StudioImagesTexts;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(false);
            const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
            if (files.length) addTempFiles(files);
        },
        [addTempFiles, setDragOver]
    );

    const onSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) addTempFiles(files);
            e.target.value = "";
        },
        [addTempFiles]
    );



    return (
        <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
            <label className="text-sm" htmlFor="studio-upload-input">{t.upload}</label>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple={true}
                id="studio-upload-input"
                aria-label="اختيار ملفات صور"
                title="اختيار ملفات صور"
                onChange={onSelect}
                className="hidden"
            />
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30"}`}
                onClick={() => inputRef.current?.click()}
                style={{ minHeight: "120px" }}
            >
                <div className="text-sm mb-2">اسحب وأفلت الصور هنا أو انقر للاختيار</div>
                <div className="text-xs text-muted-foreground">PNG, JPG, GIF</div>
            </div>
            {/* قائمة الصور المؤقتة تظهر أسفل منطقة السحب فقط إذا تم اختيار صور */}
            {tempFiles.length > 0 && (
                <TempUploadList
                    files={tempFiles}
                    onRemove={removeTempFile}
                    uploading={uploading}
                    uploadTempFiles={uploadTempFiles}
                    t={t}
                />
            )}
            {/* زر رفع الصور يظهر فقط إذا تم اختيار صور */}
            {tempFiles.length > 0 && (
                <Button
                    variant="default"
                    className="self-end"
                    onClick={uploadTempFiles}
                    disabled={uploading || tempFiles.length === 0}
                >
                    {t.tempUploadBtn}
                </Button>
            )}
            {uploading && (
                <div className="flex items-center gap-3">
                    <div className="w-full h-2 rounded bg-muted overflow-hidden">
                        <div className="h-full w-1/2 bg-primary animate-pulse" />
                    </div>
                    <div className="text-sm">{t.uploading}</div>
                </div>
            )}
        </div>
    );
};

export default UploadSection;
