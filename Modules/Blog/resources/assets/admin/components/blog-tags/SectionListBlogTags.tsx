import SectionListGeneric from '@/components/table/SectionListGeneric';
import { usePage } from '@inertiajs/react';
import { type JSX, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { blogTagColumnLabels } from '../../label';
import type { BlogTag } from '../../type';
import { useTableBlogTags } from '../../hooks/blog-tags/useTableBlogTags';
import BlogTagDrawerForm from './forms/BlogTagForm';
import BlogTagTranslateDrawerForm from './forms/BlogTagTranslateForm';

export default function SectionListBlogTags(): JSX.Element {
    const tags = usePage().props.tags as Pagination<BlogTag>;
    const { t } = useTranslation('blog');

    const {
        deleteRow,
        isFormOpen,
        isTranslateFormOpen,
        formItem,
        translateItem,
        closeForm,
        closeTranslateForm,
        onCreate,
        addRow,
        updateRow,
        ...hookProps
    } = useTableBlogTags({ tags });

    const columnLabels = useMemo(() => blogTagColumnLabels(t), [t]);

    return (
        <>
            <SectionListGeneric
                tableId="blog-tags"
                initHook={{
                    ...hookProps,
                    deleteRow,
                    onCreate,
                }}
                columnLabels={columnLabels}
            />

            <BlogTagDrawerForm
                open={isFormOpen}
                item={formItem}
                onOpenChange={(open) => !open && closeForm()}
                onSaved={(saved) => {
                    if (formItem) {
                        updateRow(saved);
                    } else {
                        addRow(saved);
                    }
                }}
            />

            <BlogTagTranslateDrawerForm
                open={isTranslateFormOpen}
                item={translateItem}
                onOpenChange={(open) => !open && closeTranslateForm()}
                onSaved={(saved) => {
                    updateRow(saved);
                }}
            />
        </>
    );
}
