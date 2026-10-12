import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAxiosErrorMessage } from '@/hooks/httpErrors';
import { useResourceActions } from '@/features/table/hooks/useResourceActions';
import tags from '@/routes/blog/tags';
import { toggleTagStatus } from '../../services/blog_tag.service';
import type { BlogTag } from '../../types/tag';

export function useBlogTagActions({ tableId, tableData }: { tableId: string; tableData: BlogTag[] }) {
    const { t: tMain } = useTranslation('main');
    const { t } = useTranslation('blog');

    const [isTranslateFormOpen, setIsTranslateFormOpen] = useState(false);
    const [translateItem, setTranslateItem] = useState<BlogTag | null>(null);

    const resource = useResourceActions<BlogTag>({
        tableId,
        tableData,
        resourceName: t('Tags'),
        getId: (x) => x.id,
        getName: (x) => x.name,
        destroyRoute: (id) => tags.destroy(id),
        updateRoute: (id) => tags.update(id),
        extractUpdated: (res) => res.data?.tag ?? res.data?.data ?? null,
    });

    const translateRow = (tag: BlogTag) => {
        setTranslateItem(tag);
        setIsTranslateFormOpen(true);
    };

    const closeTranslateForm = () => {
        setIsTranslateFormOpen(false);
        setTranslateItem(null);
    };

    const handleToggleActive = async (item: BlogTag, nextActive: boolean): Promise<boolean> => {
        const toastId = toast.loading(tMain('updating', { resource: t('Tags'), name: item.name }));

        try {
            const updated = await toggleTagStatus(item, nextActive);
            resource.rows.update(updated);
            toast.success(tMain('updated', { resource: t('Tags'), name: item.name }), { id: toastId });
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
