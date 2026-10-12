import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAxiosErrorMessage, normalizeValidationErrors } from '@/hooks/httpErrors';
import { saveCategory } from '../../services/blog_category.service';
import type { BlogCategory, BlogCategoryPayload } from '../../types/category';

interface Props {
    open: boolean;
    item: BlogCategory | null;
    onOpenChange: (open: boolean) => void;
    onSaved?: (category: BlogCategory) => void;
}

export function useBlogCategoryDrawerForm({ open, item, onOpenChange, onSaved }: Props) {
    const { t } = useTranslation('blog');
    const { t: tMain } = useTranslation('main');

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isActive, setIsActive] = useState<boolean>(true);

    useEffect(() => {
        if (open) {
            setIsActive(item?.is_active ?? true);
        } else {
            setErrors({});
            setProcessing(false);
        }
    }, [open, item]);

    const resetAndClose = useCallback(() => {
        setErrors({});
        onOpenChange(false);
    }, [onOpenChange]);

    const submit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (processing) return;

        setProcessing(true);
        setErrors({});

        const formData = new FormData(event.currentTarget);
        const payload: BlogCategoryPayload = {
            name: String(formData.get('name') ?? '').trim(),
            description: String(formData.get('description') ?? '').trim(),
            is_active: isActive,
        };

        const toastId = toast.loading(
            tMain(item ? 'updating' : 'creating', {
                resource: t('Category'),
                name: item?.name || '',
            }),
        );

        try {
            const saved = await saveCategory(item, payload);
            toast.success(
                tMain(item ? 'updated' : 'created', {
                    resource: t('Category'),
                    name: saved.name,
                }),
                { id: toastId },
            );
            onSaved?.(saved);
            resetAndClose();
        } catch (error: any) {
            if (error?.response?.status === 422) {
                const validationErrors = normalizeValidationErrors(error.response.data?.errors);
                setErrors(validationErrors);
            }
            toast.error(getAxiosErrorMessage(error), { id: toastId });
        } finally {
            setProcessing(false);
        }
    }, [isActive, item, onSaved, processing, resetAndClose, t, tMain]);

    return {
        processing,
        errors,
        isActive,
        setIsActive,
        submit,
        resetAndClose,
    };
}
