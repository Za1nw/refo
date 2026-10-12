import { getCookie, setCookie } from '@/lib/cookies';
import { index } from '@/routes/blog';
import type { Blog } from '../../types/blog';
import {
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { router, usePage, useForm } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export type BlogFormSection = {
    id: string;
    title: string;
    isShowTitle?: boolean;
    isShowDescription?: boolean;
};

type SectionColumnKey = 'primary' | 'secondary';

interface SectionColumnsState {
    primary: string[];
    secondary: string[];
}

const SECTION_COLUMNS_COOKIE = 'blog_form_sections_columns';
const LOCKED_SECTION_IDS = new Set<string>(['general']);

/**
 * حاول قراءة حالة أعمدة الأقسام من قيمة مُخزّنة (كوكي)
 * - تتوقع قيمة مشفّرة عبر `encodeURIComponent(JSON.stringify(...))`
 * - ترجع `null` إذا كانت القيمة غير صالحة
 */
function parseColumns(value: string | null): SectionColumnsState | null {
    if (!value) {
        return null;
    }

    try {
        const parsed = JSON.parse(decodeURIComponent(value)) as { primary?: unknown; secondary?: unknown };

        return {
            primary: Array.isArray(parsed.primary) ? parsed.primary.map(String) : [],
            secondary: Array.isArray(parsed.secondary) ? parsed.secondary.map(String) : [],
        };
    } catch {
        return null;
    }
}

/**
 * طبعياً نريد أن نضمن أن أي أعمدة مخزنة تتوافق مع مجموعة الأقسام الحالية.
 * هذه الدالة تقوم بالتالي:
 * - تحتفظ فقط بالـ ids الموجودة فعلاً
 * - تمنع تكرار الـ id في العمودين
 * - تضيف أي أقسام مفقودة تلقائياً إلى العمود الثانوي
 */
function normalizeColumns(columns: SectionColumnsState, allIds: string[]): SectionColumnsState {
    const idsSet = new Set(allIds);
    const primary = columns.primary.filter((id) => idsSet.has(id));
    const secondary = columns.secondary.filter((id) => idsSet.has(id) && !primary.includes(id));
    const missing = allIds.filter((id) => !primary.includes(id) && !secondary.includes(id));

    return {
        primary,
        secondary: [...secondary, ...missing],
    };
}

/**
 * إنشاء توزيع افتراضي للأقسام بين عمودين
 * - يعطى أولوية للقسم العام ومحتوى والصورة والحالة والمميّز لوضعها في العمود الأساسي
 */
function createDefaultColumns(sectionIds: string[]): SectionColumnsState {
    const primaryPriority = new Set(['general', 'content', 'image', 'status', 'featured']);
    const primary = sectionIds.filter((id) => primaryPriority.has(id));
    const secondary = sectionIds.filter((id) => !primaryPriority.has(id));

    return { primary, secondary };
}

/**
 * Hooks: إدارة نموذج التدوينة (إنشاء / تعديل)
 *
 * الوصف:
 * هذا الهوك يوفّر كل حالة النموذج واللوجيك الضروري لصفحة إدارة التدوينات في لوحة التحكم:
 * - إعداد `form` عبر `useForm` من Inertia مع القيم الافتراضية (عند التعديل يتم تعبئة الحقول)
 * - ترتيب أقسام النموذج (سحب وإفلات) مع تخزين التفضيل في كوكي
 * - دالة `submit` تعمل كـ create أو update حسب قيمة `mode`، وتعرض رسائل نجاح/فشل
 *
 * المعالجة:
 * - عند وجود أخطاء تحقق (`errors`) يتم تعيينها على `form.setErrors` إن كانت متاحة
 *   كما تُعرض ملخّصًا عبر `toast.error` (محدود لثلاث رسائل لراحة المستخدم).
 * - إن وجدت رسائل Flash من الخادم (`flash.success` / `flash.error`) فستُعرض بدل الرسائل الافتراضية.
 *
 * @param mode 'create' | 'edit' يحدد سلوك `submit`
 */
export function useBlogFormState(mode: 'create' | 'edit') {
    const { t } = useTranslation('blog');
    const { t: tMain } = useTranslation('main');

    const page = usePage();
    const blog = (page.props.blog ?? null) as Blog | null;

    const resolvedCategoryId = (() => {
        const rawCategory = (blog as any)?.category;
        const value =
            (blog as any)?.category_id
            ?? rawCategory?.id
            ?? rawCategory?.data?.id
            ?? 0;

        const parsed = Number(value);

        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    })();

    const resolvedTagIds = (() => {
        const fromTagIds = Array.isArray((blog as any)?.tag_ids)
            ? ((blog as any).tag_ids as Array<number | string>)
            : [];

        const rawTags = (blog as any)?.tags;
        const fromTagsArray = Array.isArray(rawTags)
            ? rawTags
            : Array.isArray(rawTags?.data)
              ? rawTags.data
              : [];

        const merged = [
            ...fromTagIds,
            ...fromTagsArray.map((tag: any) => tag?.id ?? tag?.tag_id ?? tag?.pivot?.tag_id ?? 0),
        ];

        return Array.from(new Set(merged.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)));
    })();

    const form = useForm({
        slug: blog?.slug ?? '',
        title: blog?.title ?? '',
        description: blog?.description ?? '',
        content: (blog as any)?.content ?? '',
        image: null as File | null,
        category_id: resolvedCategoryId > 0 ? resolvedCategoryId : '',
        tag_ids: resolvedTagIds,
        is_active: (blog as any)?.is_active ?? 1,
        is_featured: (blog as any)?.is_featured ?? 0,
    });

    const allSections: BlogFormSection[] = useMemo(
        () => [
            { id: 'general', title: t('General') },
            { id: 'content', title: t('Content') },
            { id: 'image', title: t('Image') },
            { id: 'category', title: t('Category') },
            { id: 'tags', title: t('Tags') },
            { id: 'status', title: t('Status') },
            { id: 'featured', title: t('Featured') },
        ],
        [t],
    );

    const sectionIds = useMemo(() => allSections.map((s) => s.id), [allSections]);

    const [columns, setColumns] = useState<SectionColumnsState>(() => {
        const parsed = parseColumns(getCookie(SECTION_COLUMNS_COOKIE));
        const normalized = normalizeColumns(parsed ?? createDefaultColumns(sectionIds), sectionIds);

        return normalized;
    });

    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [overSectionId, setOverSectionId] = useState<string | null>(null);
    const [lastDroppedSectionId, setLastDroppedSectionId] = useState<string | null>(null);

    // Sensors: إعداد حسّاسات السحب (ماوس، لمس، لوحة مفاتيح)
    // تُستخدم مع @dnd-kit/core لتفعيل سلوك السحب والإفلات بطريقة مناسبة للأجهزة المختلفة.
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } }),
        useSensor(KeyboardSensor),
    );

    const primarySections = useMemo(
        () => columns.primary.map((id) => allSections.find((s) => s.id === id)).filter(Boolean) as BlogFormSection[],
        [allSections, columns.primary],
    );

    const secondarySections = useMemo(
        () => columns.secondary.map((id) => allSections.find((s) => s.id === id)).filter(Boolean) as BlogFormSection[],
        [allSections, columns.secondary],
    );

    /**
     * هل القسم ذو `id` مقفل من النقل؟
     * الأقسام المقفولة لا يمكن سحبها أو تغيير موقعها.
     */
    const isSectionLocked = useCallback((id: string) => LOCKED_SECTION_IDS.has(id), []);

    /**
     * احفظ التوزيع الحالي للأعمدة في الحالة وفي كوكي (مدة 365 يوم)
     */
    const persistColumns = useCallback(
        (next: SectionColumnsState) => {
            setColumns(next);
            setCookie(SECTION_COLUMNS_COOKIE, encodeURIComponent(JSON.stringify(next)), 365);
        },
        [],
    );

    /**
     * أوجد أي عمود يحتوي على `id` المعطى ('primary' أو 'secondary')
     * يعيد `null` إن لم يتم العثور عليه.
     */
    const findContainer = useCallback(
        (id: string): SectionColumnKey | null => {
            if (columns.primary.includes(id)) return 'primary';
            if (columns.secondary.includes(id)) return 'secondary';
            return null;
        },
        [columns.primary, columns.secondary],
    );

    /**
     * عند بدء سحب قسم: سجّل الـ id كقيد نشط ومؤشر فوق
     */
    const handleSectionDragStart = useCallback((event: DragStartEvent) => {
        const id = String(event.active.id);
        setActiveSectionId(id);
        setOverSectionId(id);
    }, []);

    /**
     * عند إلغاء السحب: أزل حالة العنصر النشط والمؤشر
     */
    const handleSectionDragCancel = useCallback(() => {
        setActiveSectionId(null);
        setOverSectionId(null);
    }, []);

    /**
     * أثناء السحب فوق عنصر آخر: حدّث الـ `overSectionId` للمؤشر البصري
     */
    const handleSectionDragOver = useCallback(
        (event: DragOverEvent) => {
            const overId = event.over?.id;
            if (!overId) return;
            setOverSectionId(String(overId));
        },
        [],
    );

    /**
     * عند انتهاء عملية السحب: حدّث ترتيب الأعمدة بناءً على المصدر والهدف
     * - يتجاهل النقل إذا:
     *   - لم يتم الإفلات فوق عنصر
     *   - المصدر والهدف نفس العنصر
     *   - العنصر مقفول
     * - يضبط الترتيب الجديد ثم يقوم بتطبيعه وحفظه
     */
    const handleSectionDragEnd = useCallback(
        (event: DragEndEvent) => {
            const activeId = String(event.active.id);
            const overIdRaw = event.over?.id;

            setActiveSectionId(null);
            setOverSectionId(null);

            if (!overIdRaw) {
                return;
            }

            const overId = String(overIdRaw);
            if (activeId === overId) {
                return;
            }

            if (LOCKED_SECTION_IDS.has(activeId)) {
                return;
            }

            const activeContainer = findContainer(activeId);
            const overContainer = overId === 'primary' || overId === 'secondary' ? (overId as SectionColumnKey) : findContainer(overId);
            if (!activeContainer || !overContainer) {
                return;
            }

            const next: SectionColumnsState = {
                primary: [...columns.primary],
                secondary: [...columns.secondary],
            };

            const activeList = next[activeContainer];
            const overList = next[overContainer];

            const activeIndex = activeList.indexOf(activeId);
            if (activeIndex === -1) {
                return;
            }

            activeList.splice(activeIndex, 1);

            const overIndex = overList.indexOf(overId);
            if (overIndex === -1) {
                overList.push(activeId);
            } else {
                overList.splice(overIndex, 0, activeId);
            }

            const normalized = normalizeColumns(next, sectionIds);
            persistColumns(normalized);
            setLastDroppedSectionId(activeId);
        },
        [columns.primary, columns.secondary, findContainer, persistColumns, sectionIds],
    );

    /**
     * استخرج رسالة نجاح من استجابة Inertia إن وجدت، وإلا ارجع null
     * @param inertiaPage الصفحة المرسلة من استجابة Inertia (اختياري)
     */
    const extractFlashSuccess = useCallback((inertiaPage?: any): string | null => {
        const flashFromResponse = inertiaPage?.props?.flash?.success;
        const flashFromPage = (page.props as any)?.flash?.success;

        const value = flashFromResponse ?? flashFromPage ?? null;
        return value != null ? String(value) : null;
    }, [page.props]);

    /**
     * استخرج رسالة خطأ عامة من `page.props.flash.error` إن وجدت
     */
    const extractFlashError = useCallback((): string | null => {
        const value = (page.props as any)?.flash?.error ?? null;
        return value != null ? String(value) : null;
    }, [page.props]);

    /**
     * حوّل كائن أخطاء التحقق إلى نص موجز مناسب للعرض في توست
     * - يجمع أول رسالة لكل حقل
     * - يقصر العرض إلى 3 رسائل مع ملحوظة بوجود "أخطاء أخرى" إن وُجدت
     */
    const formatValidationErrors = useCallback((errors?: Record<string, any>): string | null => {
        if (!errors || typeof errors !== 'object') return null;

        const messages: string[] = [];
        for (const key of Object.keys(errors)) {
            const val = errors[key];
            if (Array.isArray(val) && val.length > 0) messages.push(String(val[0]));
            else if (typeof val === 'string' && val.length) messages.push(val);
        }

        if (messages.length === 0) return null;

        const max = 3;
        const slice = messages.slice(0, max);
        const more = messages.length > max ? ` و${messages.length - max} أخطاء أخرى` : '';

        return slice.join('، ') + more;
    }, []);

    /**
     * عرض رسالة نجاح: تفضّل رسالة الفلاش إن وُجدت وإلا تعرض الرسالة الافتراضية
     */
    const handleSuccess = useCallback((defaultMessage: string, inertiaPage?: any) => {
        const message = extractFlashSuccess(inertiaPage) ?? defaultMessage;
        toast.success(message);
    }, [extractFlashSuccess]);

    /**
     * عرض رسالة خطأ: تفضّل رسالة الفلاش إن وُجدت وإلا تعرض الرسالة الافتراضية
     */
    const handleError = useCallback((defaultMessage: string) => {
        const message = extractFlashError() ?? defaultMessage;
        toast.error(message);
    }, [extractFlashError]);

    /**
     * دالة الإرسال: تنفّذ إنشاء أو تحديث بحسب `mode` وتتعامل مع النجاح/الفشل
     */
    const submit = useCallback(() => {
        const title = String(form.data.title ?? '');

        if (mode === 'create') {
            form.post(index().url, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: (inertiaPage?: any) => handleSuccess(`تم إنشاء المدونة ${title} بنجاح`, inertiaPage),
                onError: (errors?: Record<string, any>) => {
                    // إذا توفّرت دالة تعيين الأخطاء على الفورم فضع الأخطاء هناك
                    if (typeof (form as any).setErrors === 'function') {
                        (form as any).setErrors(errors ?? {});
                    }

                    const validationMessage = formatValidationErrors(errors);
                    if (validationMessage) {
                        toast.error(validationMessage);
                        return;
                    }

                    handleError('حدث خطأ أثناء إنشاء المدونة');
                },
            });

            return;
        }

        if (!blog) return;

        router.post(
            `${index().url}/${(blog as any).id}`,
            { ...form.data, _method: 'put' },
            {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: (inertiaPage?: any) => handleSuccess(`تم تحديث المدونة ${title} بنجاح`, inertiaPage),
                onError: (errors?: Record<string, any>) => {
                    if (typeof (form as any).setErrors === 'function') {
                        (form as any).setErrors(errors ?? {});
                    }

                    const validationMessage = formatValidationErrors(errors);
                    if (validationMessage) {
                        toast.error(validationMessage);
                        return;
                    }

                    handleError('حدث خطأ أثناء تحديث المدونة');
                },
            },
        );
    }, [blog, form, mode, handleSuccess, handleError]);

    return {
        t,
        tMain,
        blog,
        form,
        processing: form.processing,
        sensors,
        activeSectionId,
        overSectionId,
        lastDroppedSectionId,
        primarySections,
        secondarySections,
        submit,
        handleSectionDragCancel,
        handleSectionDragOver,
        handleSectionDragEnd,
        handleSectionDragStart,
        isSectionLocked,
    };
}
