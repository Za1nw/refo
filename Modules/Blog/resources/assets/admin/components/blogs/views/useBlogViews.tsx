import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Table2 } from 'lucide-react';
import type { TableViewOption } from '@/components/table/SectionListGeneric';
import BlogCardsView from './BlogCardsView';
import BlogListView from './BlogListView';

/**
 * هوك تعريف وتجهيز أنماط عرض المدونات (`useBlogViews`):
 * يجمّع خيارات العرض (جدول افتراضي، قائمة رأسية، وشبكة كروت) مع الأيقونات والتسميات المترجمة.
 */
export function useBlogViews(): TableViewOption[] {
    const { t } = useTranslation('blog');

    return useMemo(
        () => [
            {
                value: 'table',
                label: t('view_table'),
                icon: <Table2 size={16} />,
            },
            {
                value: 'list',
                label: t('view_list'),
                icon: <List size={16} />,
                render: () => <BlogListView />,
            },
            {
                value: 'cards',
                label: t('view_cards'),
                icon: <LayoutGrid size={16} />,
                render: () => <BlogCardsView />,
            },
        ],
        [t],
    );
}

export default useBlogViews;
