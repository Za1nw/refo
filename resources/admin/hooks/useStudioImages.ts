import { useReducer, useCallback, useMemo } from "react";
import type { ImageItem } from "@/types/photo";
import { toast } from "sonner";

/** نتيجة جلب الصور paginated */
export type PaginatedImagesResult = {
    data: ImageItem[];
    links?: any;
    meta?: any;
    has_more: boolean;
    next_page: number | null;
};

/** نتيجة رفع الصور */
export type UploadResult = { data: ImageItem[] } | { successful: { data?: ImageItem[] }; failed?: unknown };

/** نصوص الواجهة (دعم الترجمة) */
export type StudioImagesTexts = {
    title: string;
    subtitle: string;
    gallery: string;
    upload: string;
    refresh: string;
    reloading: string;
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction: string;
    assignImage: string;
    selectImage: string;
    searchPlaceholder: string;
    reloadError: string;
    maxSelectedReached: string;
    uploading: string;
    uploadSuccess: (count: number) => string;
    uploadFailed: string;
    deleteSelected: string;
    confirmDelete: string;
    tempUploadTitle: string;
    tempUploadDesc: string;
    tempUploadBtn: string;
    tempRemove: string;
};

/** خصائص مكون إدارة الصور */
export type StudioImagesProps = {
    isOpen: boolean;
    onClose: (open: boolean | null) => void;
    fetchImages?: (page?: number, search?: string) => Promise<PaginatedImagesResult>;
    onImageSelect: (image: ImageItem | ImageItem[]) => void;
    onImageUpload?: (files: File[]) => Promise<UploadResult>;
    onImageDelete?: (ids: (string | number)[]) => Promise<void>;
    isMulti?: boolean;
    maxSelectable?: number;
    texts?: Partial<StudioImagesTexts>;
};

// النصوص الافتراضية
export const defaultTexts: StudioImagesTexts = {
    title: "إدارة الصور",
    subtitle: "اختر صورة من المكتبة أو قم بتحميل صورة جديدة لتعيينها.",
    gallery: "معرض الصور",
    upload: "رفع صور",
    refresh: "تحديث",
    reloading: "جاري التحديث…",
    loading: "جاري التحميل…",
    emptyTitle: "لا توجد صور بعد",
    emptyDescription: "ابدأ برفع صورك لتظهر هنا.",
    emptyAction: "رفع صورة",
    assignImage: "تعيين صورة",
    selectImage: "تحديد الصورة",
    searchPlaceholder: "ابحث بالاسم…",
    reloadError: "فشل تحميل الصور",
    maxSelectedReached: "تم بلوغ الحد الأقصى للاختيار",
    uploading: "جاري الرفع…",
    uploadSuccess: (count: number) => `تم رفع ${count} صورة بنجاح`,
    uploadFailed: "فشل رفع الصور",
    deleteSelected: "حذف المحدد",
    confirmDelete: "تأكيد حذف الصور المحددة؟",
    tempUploadTitle: "رفع صور مؤقتاً",
    tempUploadDesc: "اختر صورك ثم اضغط زر رفع لإرسالها.",
    tempUploadBtn: "رفع الصور",
    tempRemove: "حذف",
};

/** الحالة الداخلية */
type TempFile = {
    file: File;
    id: string;
    name: string;
    size: number;
};

type State = {
    activeTab: "view" | "upload";
    images: ImageItem[];
    isLoading: boolean;
    error: string | null;
    selected: Set<string | number>;
    search: string;
    uploading: boolean;
    uploadError: string | null;
    uploadSuccessCount: number;
    assignLoading: boolean;
    dragOver: boolean;
    page: number;
    hasMore: boolean;
    loadingMore: boolean;
    deleting: boolean;
    tempFiles: TempFile[];
    maxSelectedWarning: boolean;
};

/** أوامر الحالة */
type Action =
    | { type: "SET_TAB"; tab: State["activeTab"] }
    | { type: "LOAD_START" }
    | { type: "LOAD_SUCCESS"; images: ImageItem[] }
    | { type: "LOAD_ERROR"; error: string }
    | { type: "SET_SEARCH"; search: string }
    | { type: "TOGGLE_SELECT"; id: string | number; isMulti: boolean; maxSelectable?: number }
    | { type: "CLEAR_SELECT" }
    | { type: "UPLOAD_START" }
    | { type: "UPLOAD_SUCCESS"; added: ImageItem[] }
    | { type: "UPLOAD_ERROR"; error: string }
    | { type: "UPLOAD_END" }
    | { type: "ASSIGN_START" }
    | { type: "ASSIGN_END" }
    | { type: "SET_DRAG_OVER"; value: boolean }
    | { type: "LOAD_MORE_START" }
    | { type: "LOAD_MORE_SUCCESS"; images: ImageItem[]; hasMore: boolean; nextPage: number }
    | { type: "LOAD_MORE_ERROR"; error: string }
    | { type: "ADD_TEMP_FILES"; files: TempFile[] }
    | { type: "REMOVE_TEMP_FILE"; id: string }
    | { type: "UPLOAD_TEMP_START" }
    | { type: "UPLOAD_TEMP_SUCCESS"; added: ImageItem[] }
    | { type: "UPLOAD_TEMP_ERROR"; error: string }
    | { type: "UPLOAD_TEMP_END" }
    | { type: "DELETE_START" }
    | { type: "DELETE_SUCCESS"; deletedIds: (string | number)[] }
    | { type: "DELETE_ERROR"; error: string }
    | { type: "DELETE_END" }
    | { type: "MAX_SELECTED_WARNING" };

const initialState: State = {
    activeTab: "view",
    images: [],
    isLoading: false,
    error: null,
    selected: new Set(),
    search: "",
    uploading: false,
    uploadError: null,
    uploadSuccessCount: 0,
    assignLoading: false,
    dragOver: false,
    page: 1,
    hasMore: true,
    loadingMore: false,
    deleting: false,
    tempFiles: [],
    maxSelectedWarning: false,
};

/** دالة تحديث الحالة */
function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_TAB":
            return { ...state, activeTab: action.tab };
        case "LOAD_START":
            return { ...state, isLoading: true, error: null, page: 1, hasMore: true, images: [] };
        case "LOAD_SUCCESS":
            return { ...state, isLoading: false, images: action.images, error: null, page: 1, hasMore: true };
        case "LOAD_ERROR":
            return { ...state, isLoading: false, error: action.error };
        case "LOAD_MORE_START":
            return { ...state, loadingMore: true };
        case "LOAD_MORE_SUCCESS":
            return {
                ...state,
                images: [...state.images, ...action.images],
                loadingMore: false,
                hasMore: action.hasMore,
                page: action.nextPage,
            };
        case "LOAD_MORE_ERROR":
            return { ...state, loadingMore: false, error: action.error };
        case "ADD_TEMP_FILES":
            return { ...state, tempFiles: [...state.tempFiles, ...action.files] };
        case "REMOVE_TEMP_FILE":
            return { ...state, tempFiles: state.tempFiles.filter(f => f.id !== action.id) };
        case "UPLOAD_TEMP_START":
            return { ...state, uploading: true, uploadError: null, uploadSuccessCount: 0 };
        case "UPLOAD_TEMP_SUCCESS":
            return {
                ...state,
                images: [...action.added, ...state.images],
                uploadSuccessCount: action.added.length,
                uploadError: null,
                tempFiles: [],
            };
        case "UPLOAD_TEMP_ERROR":
            return { ...state, uploadError: action.error };
        case "UPLOAD_TEMP_END":
            return { ...state, uploading: false };
        case "DELETE_START":
            return { ...state, deleting: true };
        case "DELETE_SUCCESS":
            return {
                ...state,
                images: state.images.filter(img => !action.deletedIds.includes(img.id)),
                selected: new Set(),
                deleting: false,
            };
        case "DELETE_ERROR":
            return { ...state, error: action.error, deleting: false };
        case "DELETE_END":
            return { ...state, deleting: false };
        case "MAX_SELECTED_WARNING":
            return { ...state, maxSelectedWarning: true };
        case "TOGGLE_SELECT": {
            const next = new Set(state.selected);
            const isSelected = next.has(action.id);
            const max = action.maxSelectable ?? 20;
            if (!action.isMulti) {
                next.clear();
                if (!isSelected) next.add(action.id);
                else if (isSelected) next.delete(action.id);
                return { ...state, selected: next, maxSelectedWarning: false };
            }
            if (isSelected) {
                next.delete(action.id);
                return { ...state, selected: next, maxSelectedWarning: false };
            }
            if (next.size >= max) {
                return { ...state, maxSelectedWarning: true };
            }
            next.add(action.id);
            return { ...state, selected: next, maxSelectedWarning: false };
        }
        default:
            return state;
    }
}

/**
 * هوك إدارة الصور في الاستوديو باستخدام دوال الجلب والرفع والحذف الممرّرة من المستدعي.
 */
export default function useStudioImages(
    handlers: Pick<StudioImagesProps, 'fetchImages' | 'onImageUpload' | 'onImageDelete'>,
    isMulti: boolean,
    selected?: (photo: ImageItem | ImageItem[]) => void,
    maxSelectable: number = 20
) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // جلب الصور من API (paginated)
    const fetchImages = useCallback(async (page = 1, search = ""): Promise<PaginatedImagesResult> => {
        if (!handlers.fetchImages) {
            throw new Error(defaultTexts.reloadError);
        }
        return handlers.fetchImages(page, search);
    }, [handlers.fetchImages]);

    // جلب الصفحة الأولى
    const loadImages = useCallback(async (search = "") => {
        dispatch({ type: "LOAD_START" });
        try {
            const res = await fetchImages(1, search);
            dispatch({ type: "LOAD_SUCCESS", images: res.data });
            dispatch({ type: "LOAD_MORE_SUCCESS", images: [], hasMore: res.has_more, nextPage: res.next_page ?? 2 });
        } catch (e: any) {
            dispatch({ type: "LOAD_ERROR", error: e?.message ?? defaultTexts.reloadError });
        }
    }, [fetchImages]);

    // جلب المزيد من الصور (pagination)
    const fetchMore = useCallback(async () => {
        if (!state.hasMore || state.loadingMore) return;
        dispatch({ type: "LOAD_MORE_START" });
        try {
            const res = await fetchImages(state.page, state.search);
            dispatch({
                type: "LOAD_MORE_SUCCESS",
                images: res.data,
                hasMore: res.has_more,
                nextPage: res.next_page ?? state.page + 1,
            });
        } catch (e: any) {
            dispatch({ type: "LOAD_MORE_ERROR", error: e?.message ?? defaultTexts.reloadError });
        }
    }, [fetchImages, state.hasMore, state.loadingMore, state.page, state.search]);

    // رفع الصور (مؤقت ثم رفع نهائي)
    const uploadImages = useCallback(async (files: File[]): Promise<UploadResult> => {
        if (!handlers.onImageUpload) {
            throw new Error(defaultTexts.uploadFailed);
        }
        return handlers.onImageUpload(files);
    }, [handlers.onImageUpload]);

    // إضافة ملفات مؤقتة للرفع
    const addTempFiles = useCallback((files: File[]) => {
        const tempFiles: TempFile[] = files.map((f) => ({
            file: f,
            id: `${f.name}-${f.size}-${f.lastModified}-${Math.random()}`,
            name: f.name,
            size: f.size,
        }));
        dispatch({ type: "ADD_TEMP_FILES", files: tempFiles });
    }, []);

    // حذف ملف مؤقت قبل الرفع
    const removeTempFile = useCallback((id: string) => {
        dispatch({ type: "REMOVE_TEMP_FILE", id });
    }, []);

    // رفع الملفات المؤقتة دفعة واحدة
    const uploadTempFiles = useCallback(async () => {
        if (!state.tempFiles.length) return;
        dispatch({ type: "UPLOAD_TEMP_START" });
        const toastId = toast.loading("جاري رفع " + state.tempFiles.length + " صورة...");
        try {
            const files = state.tempFiles.map(f => f.file);
            const result = await uploadImages(files);

            const newImages = 'data' in result ? result.data : result.successful.data ?? [];
            if (newImages.length) {
                dispatch({ type: "UPLOAD_TEMP_SUCCESS", added: newImages });
                // عرض Toast عند النجاح
                toast.success(defaultTexts.uploadSuccess(newImages.length));
            } else {
                dispatch({ type: "UPLOAD_TEMP_ERROR", error: defaultTexts.uploadFailed });
                // عرض Toast عند الفشل
                toast.error(defaultTexts.uploadFailed);
            }
        } catch (e: any) {
            dispatch({ type: "UPLOAD_TEMP_ERROR", error: defaultTexts.uploadFailed });
            // عرض Toast مع رسالة الخطأ إذا توفرت
            toast.error(`${defaultTexts.uploadFailed}${e?.message ? ": " + e.message : ""}`);
        } finally {
            dispatch({ type: "UPLOAD_TEMP_END" });
            toast.dismiss(toastId);
        }
    }, [uploadImages, state.tempFiles]);

    // اختيار صورة (single/multi)
    const toggleSelect = useCallback(
        (id: string | number) => {
            dispatch({ type: "TOGGLE_SELECT", id, isMulti, maxSelectable });
        },
        [isMulti, maxSelectable]
    );

    // حذف الصور المختارة من الاستوديو
    const deleteImages = useCallback(async (ids: (string | number)[]) => {
        if (!handlers.onImageDelete) {
            throw new Error(defaultTexts.reloadError);
        }
        await handlers.onImageDelete(ids);
    }, [handlers.onImageDelete]);

    // حذف الصور المختارة (مع تحديث الحالة)
    const removeSelected = useCallback(async () => {
        if (state.selected.size === 0) return;
        dispatch({ type: "DELETE_START" });
        const toastId = toast.loading("جاري حذف الصور المحددة...");
        try {
            const ids = Array.from(state.selected);
            await deleteImages(ids);
            dispatch({ type: "DELETE_SUCCESS", deletedIds: ids });
        } catch (e: any) {
            dispatch({ type: "DELETE_ERROR", error: e?.message ?? defaultTexts.reloadError });
        } finally {
            dispatch({ type: "DELETE_END" });
            toast.dismiss(toastId);
        }
    }, [deleteImages, state.selected]);

    // بحث الصور
    const filteredImages = useMemo(() => {
        const q = state.search.trim().toLowerCase();
        if (!q) return state.images;
        return state.images.filter((img) => {
            const nm = (img.name ?? "").toLowerCase();
            const idStr = String(img.id).toLowerCase();
            return nm.includes(q) || idStr.includes(q);
        });
    }, [state.images, state.search]);

    // الصور المختارة
    const selectedImages = useMemo(
        () => state.images.filter((img) => state.selected.has(img.id)),
        [state.images, state.selected]
    );

    // تحديث البحث
    const setSearch = useCallback((search: string) => {
        dispatch({ type: "SET_SEARCH", search });
    }, []);

    return {
        state,
        dispatch,
        loadImages,
        fetchMore,
        addTempFiles,
        removeTempFile,
        uploadTempFiles,
        toggleSelect,
        removeSelected,
        filteredImages,
        selectedImages,
        setSearch, // expose setSearch to update search value
    };
}
