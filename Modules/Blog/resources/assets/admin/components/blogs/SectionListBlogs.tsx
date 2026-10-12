import { type JSX, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SectionListGeneric from '@/components/table/SectionListGeneric';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/blog';

import { useTableBlog } from '../../hooks/blogs/useTableBlog';
import { getBlogColumnLabels } from '../../lables/getBlogColumnLabels';
import { useBlogViews } from './views';
import type { Blog } from '../../types/blog';

/**
 * المكون الرئيسي المجمع لجدول وقوائم المدونات (`SectionListBlogs`):
 * - يستدعي هوك `useTableBlog`.
 * - يستخدم هوك `useBlogViews` لجلب أنماط العرض المتعددة المفصولة تماماً داخل مجلد `views/`.
 * - يربط فلاتر الحالة والتصنيفات وعمليات التعديل والحذف.
 */
export default function SectionListBlogs(): JSX.Element {
    const { t } = useTranslation('blog');
    const { t: tMain } = useTranslation('main');
    const blogs = usePage().props.blogs as Pagination<Blog>;

    const {
        deleteRow,
        editRow,
        translateRow,
        statusFilter,
        filterByStatus,
        tableId,
        ...hookProps
    } = useTableBlog({ blogs });

    const columnLabels = useMemo(() => getBlogColumnLabels(t), [t]);
    const views = useBlogViews();

    const actions = useMemo(
        () => ({
            onEdit: editRow,
            onDelete: deleteRow,
            onTranslate: translateRow,
        }),
        [deleteRow, editRow, translateRow],
    );

    return (
        <SectionListGeneric
            tableId={tableId}
            initHook={{
                ...hookProps,
                deleteRow,
                actions,
                views,
                onCreate: () => router.visit(`${index().url}/create`),
                filterActions: (
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => filterByStatus(val as any)}
                        >
                            <SelectTrigger className="w-36" aria-label={t('Status')}>
                                <SelectValue placeholder={t('Status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{tMain('all_statuses') || 'الكل'}</SelectItem>
                                <SelectItem value="active">{t('active')}</SelectItem>
                                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                ),
            }}
            columnLabels={columnLabels}
        />
    );
}
