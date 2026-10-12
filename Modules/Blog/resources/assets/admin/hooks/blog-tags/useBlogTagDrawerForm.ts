import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAxiosErrorMessage, normalizeValidationErrors } from '@/hooks/httpErrors';
import { saveTag } from '../../services/blog_tag.service';
import type { BlogTag, BlogTagPayload } from '../../types/tag';

interface Props {
    open: boolean;
    item: BlogTag | null;
    onOpenChange: (open: boolean) => void;
    onSaved?: (tag: BlogTag) => void;
}

export function useBlogTagDrawerForm({ open, item, onOpenChange, onSaved }: Props) {
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
        const payload: BlogTagPayload = {
            name: String(formData.get('name') ?? '').trim(),
            is_active: isActive,
        };

        const toastId = toast.loading(
            tMain(item ? 'updating' : 'creating', {
                resource: t('Tags'),
                name: item?.name || '',
            }),
        );

        try {
            const saved = await saveTag(item, payload);
            toast.success(
                tMain(item ? 'updated' : 'created', {
                    resource: t('Tags'),
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
