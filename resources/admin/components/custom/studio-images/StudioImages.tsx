import React, { memo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useStudioImages, { StudioImagesProps, defaultTexts } from "@/hooks/useStudioImages";
import Toolbar from "./Toolbar";
import ImageGrid from "./ImageGrid";
import UploadSection from "./UploadSection";
import { ImageItem } from "@/types/photo";
import { confirmAlertDialog } from "../ConfirmDialog";


// -------------------- المكون الرئيسي --------------------

/**
 * نافذة إدارة الصور واختيارها من المعرض أو رفع صور جديدة
 */
export default function StudioImages({
    isOpen,
    onClose,
    onImageSelect,
    isMulti = false,
    maxSelectable = 20,
    texts,
    fetchImages,
    onImageUpload,
    onImageDelete,
}: StudioImagesProps) {
    const t = { ...defaultTexts, ...texts };

    // استخدام هوك إدارة الحالة
    const {
        state,
        dispatch,
        loadImages,
        fetchMore,
        toggleSelect,
        addTempFiles,
        removeTempFile,
        uploadTempFiles,
        removeSelected,
        filteredImages,
        selectedImages,
    } = useStudioImages({
        fetchImages,
        onImageUpload,
        onImageDelete,
    }, isMulti, onImageSelect, maxSelectable);

    // تحميل الصور عند فتح النافذة
    useEffect(() => {
        if (isOpen) loadImages();
    }, [isOpen]);

    // عند تبديل تحديد صورة
    const handleToggle = useCallback(
        (img: ImageItem) => {
            toggleSelect(img.id);
        },
        [toggleSelect]
    );

    // عند تأكيد الاختيار
    const handleConfirm = useCallback(async () => {
        if (selectedImages.length === 0) return;
        dispatch({ type: "ASSIGN_START" });
        try {
            await onImageSelect(isMulti ? selectedImages : selectedImages[0]);
            onClose(false);
        } finally {
            dispatch({ type: "ASSIGN_END" });
        }
    }, [dispatch, isMulti, onClose, onImageSelect, selectedImages]);

    // عند حذف الصور المختارة
    const handleDelete = useCallback(async () => {
        if (selectedImages.length === 0 || state.deleting) return;
        const ok = await confirmAlertDialog({
            title: "هل أنت متأكد؟",
            description: "سيتم حذف الصور المحددة نهائيًا."
        });
        if (ok) {
            await removeSelected();
        }
    }, [selectedImages, state.deleting, t.confirmDelete, removeSelected]);

    return (
        <Dialog open={isOpen} onOpenChange={(val) =>{
            console.log("closed");

            onClose(val as boolean);
        }} >
            <DialogContent className="h-[95dvh] !p-2 min-w-[95%] max-h-[90dvh] flex flex-col">
                <DialogHeader className="p-0 m-0 h-fit">
                    <DialogTitle>{t.title}</DialogTitle>
                    <DialogDescription className="text-center text-gray-500">
                        {t.subtitle}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 flex-1 min-h-0">
                    <Toolbar
                        activeTab={state.activeTab}
                        setTab={(tab) => dispatch({ type: "SET_TAB", tab })}
                        refresh={loadImages}
                        isLoading={state.isLoading}
                        search={state.search}
                        setSearch={(v) => dispatch({ type: "SET_SEARCH", search: v })}
                        t={t}
                    />
                    {state.activeTab === "view" ? (
                        <div className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 min-h-0 scrollbar border p-1 rounded-md">
                                {state.error ? (
                                    <div className="flex flex-col items-center gap-2 p-4">
                                        <p className="text-gray-500">{state.error}</p>
                                        <Button variant="outline" onClick={() => void loadImages()}>{t.refresh}</Button>
                                    </div>
                                ) : (
                                    <>
                                        <ImageGrid
                                            isLoading={state.isLoading}
                                            images={filteredImages}
                                            selectedSet={state.selected}
                                            onToggle={handleToggle}
                                            onEmptyUploadClick={() => dispatch({ type: "SET_TAB", tab: "upload" })}
                                            t={t}
                                        />
                                        {state.hasMore && (
                                            <div className="flex justify-center my-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={fetchMore}
                                                    disabled={state.loadingMore}
                                                >
                                                    {state.loadingMore ? t.loading : "تحميل المزيد"}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <DialogFooter className="flex gap-2 mt-2">
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={selectedImages.length === 0 || state.deleting}
                                >
                                    {t.deleteSelected}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleConfirm}
                                    disabled={selectedImages.length === 0 || state.assignLoading}
                                >
                                    {isMulti
                                        ? `${t.assignImage} (${selectedImages.length})`
                                        : t.assignImage}
                                </Button>
                            </DialogFooter>
                            {state.maxSelectedWarning && (
                                <div className="text-sm text-red-600 text-center mt-2">{t.maxSelectedReached}</div>
                            )}
                        </div>
                    ) : (
                        <UploadSection
                            isMulti={isMulti}
                            uploading={state.uploading}
                            uploadError={state.uploadError}
                            uploadSuccessCount={state.uploadSuccessCount}
                            tempFiles={state.tempFiles}
                            addTempFiles={addTempFiles}
                            removeTempFile={removeTempFile}
                            uploadTempFiles={uploadTempFiles}
                            dragOver={state.dragOver}
                            setDragOver={(v) => dispatch({ type: "SET_DRAG_OVER", value: v })}
                            t={t}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
