import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAxiosErrorMessage, normalizeValidationErrors } from '@/hooks/httpErrors';
import { getCategoryTranslation, saveCategoryTranslation } from '../../services/blog_category.service';
import type { BlogCategory } from '../../types/category';

interface Props {
    open: boolean;
    item: BlogCategory | null;
    onOpenChange: (open: boolean) => void;
    onSaved?: (category: BlogCategory) => void;
}

export function useBlogCategoryTranslateDrawerForm({ open, item, onOpenChange, onSaved }: Props) {
    const { t: tMain } = useTranslation('main');

    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [locale, setLocale] = useState('en');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (!open || !item) {
            if (!open) {
                setErrors({});
                setProcessing(false);
                setLoading(false);
                setName('');
                setDescription('');
                setLocale('en');
            }
            return;
        }

        setLoading(true);
        setErrors({});

        getCategoryTranslation(item.id)
            .then((translation) => {
                setLocale(translation.locale ?? 'en');
                setName(translation.name ?? '');
                setDescription(translation.description ?? '');
            })
            .catch((error: unknown) => {
                setLocale('en');
                setName('');
                setDescription('');
                toast.error(getAxiosErrorMessage(error));
            })
            .finally(() => setLoading(false));
    }, [item, open]);

    const resetAndClose = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    const submit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!item || processing) {
            return;
        }

        setProcessing(true);
        setErrors({});

        try {
            const saved = await saveCategoryTranslation(item.id, {
                locale,
                name: name.trim(),
                description: description.trim(),
            });

            onSaved?.(saved);
            toast.success(tMain('Saved successfully.'));
            resetAndClose();
        } catch (error: any) {
            if (error?.response?.status === 422) {
                setErrors(normalizeValidationErrors(error.response.data?.errors));
            }
            toast.error(getAxiosErrorMessage(error));
        } finally {
            setProcessing(false);
        }
    }, [description, item, locale, name, onSaved, processing, resetAndClose, tMain]);

    return {
        processing,
        loading,
        errors,
        locale,
        setLocale,
        name,
        setName,
        description,
        setDescription,
        submit,
        resetAndClose,
    };
}
