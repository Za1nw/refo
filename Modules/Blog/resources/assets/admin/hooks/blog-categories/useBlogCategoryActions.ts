import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAxiosErrorMessage } from '@/hooks/httpErrors';
import { useResourceActions } from '@/features/table/hooks/useResourceActions';
import categories from '@/routes/blog/categories';
import { toggleCategoryStatus } from '../../services/blog_category.service';
import type { BlogCategory } from '../../types/category';

export function useBlogCategoryActions({ tableId, tableData }: { tableId: string; tableData: BlogCategory[] }) {
    const { t: tMain } = useTranslation('main');
    const { t } = useTranslation('blog');

    const [isTranslateFormOpen, setIsTranslateFormOpen] = useState(false);
    const [translateItem, setTranslateItem] = useState<BlogCategory | null>(null);

    const resource = useResourceActions<BlogCategory>({
        tableId,
        tableData,
        resourceName: t('Category'),
        getId: (x) => x.id,
        getName: (x) => x.name,
        destroyRoute: (id) => categories.destroy(id),
        updateRoute: (id) => categories.update(id),
        extractUpdated: (res) => res.data?.category ?? res.data?.data ?? null,
    });

    const translateRow = (category: BlogCategory) => {
        setTranslateItem(category);
        setIsTranslateFormOpen(true);
    };

    const closeTranslateForm = () => {
        setIsTranslateFormOpen(false);
        setTranslateItem(null);
    };

    const handleToggleActive = async (item: BlogCategory, nextActive: boolean): Promise<boolean> => {
        const toastId = toast.loading(tMain('updating', { resource: t('Category'), name: item.name }));

        try {
            const updated = await toggleCategoryStatus(item, nextActive);
            resource.rows.update(updated);
            toast.success(tMain('updated', { resource: t('Category'), name: item.name }), { id: toastId });
            return true;
        } catch (error) {
            toast.error(getAxiosErrorMessage(error), { id: toastId });
            return false;
        }
    };

    return {
        ...resource,
        isTranslateFormOpen,
        translateItem,
        translateRow,
        closeTranslateForm,
        handleToggleActive,
    };
}
