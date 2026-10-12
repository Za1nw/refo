import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAxiosErrorMessage, normalizeValidationErrors } from '@/hooks/httpErrors';
import { getTagTranslation, saveTagTranslation } from '../../services/blog_tag.service';
import type { BlogTag } from '../../types/tag';

interface Props {
    open: boolean;
    item: BlogTag | null;
    onOpenChange: (open: boolean) => void;
    onSaved?: (tag: BlogTag) => void;
}

export function useBlogTagTranslateDrawerForm({ open, item, onOpenChange, onSaved }: Props) {
    const { t: tMain } = useTranslation('main');

    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [locale, setLocale] = useState('en');
    const [name, setName] = useState('');

    useEffect(() => {
        if (!open || !item) {
            if (!open) {
                setErrors({});
                setProcessing(false);
                setLoading(false);
                setName('');
                setLocale('en');
            }
            return;
        }

        setLoading(true);
        setErrors({});

        getTagTranslation(item.id)
            .then((translation) => {
                setLocale(translation.locale ?? 'en');
                setName(translation.name ?? '');
            })
            .catch((error: unknown) => {
                setLocale('en');
                setName('');
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
            const saved = await saveTagTranslation(item.id, {
                locale,
                name: name.trim(),
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
    }, [item, locale, name, onSaved, processing, resetAndClose, tMain]);

    return {
        processing,
        loading,
        errors,
        locale,
        setLocale,
        name,
        setName,
        submit,
        resetAndClose,
    };
}
