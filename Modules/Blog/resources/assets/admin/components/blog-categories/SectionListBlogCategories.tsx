import SectionListGeneric from '@/components/table/SectionListGeneric';
import { usePage } from '@inertiajs/react';
import { type JSX, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { blogCategoryColumnLabels } from '../../label';
import type { BlogCategory } from '../../type';
import { useTableBlogCategories } from '../../hooks/blog-categories/useTableBlogCategories';
import BlogCategoryDrawerForm from './forms/BlogCategoryForm';
import BlogCategoryTranslateDrawerForm from './forms/BlogCategoryTranslateForm';

export default function SectionListBlogCategories(): JSX.Element {
    const categories = usePage().props.categories as Pagination<BlogCategory>;
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
    } = useTableBlogCategories({ categories });

    const columnLabels = useMemo(() => blogCategoryColumnLabels(t), [t]);

    return (
        <>
            <SectionListGeneric
                tableId="blog-categories"
                initHook={{
                    ...hookProps,
                    deleteRow,
                    onCreate,
                }}
                columnLabels={columnLabels}
            />

            <BlogCategoryDrawerForm
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

            <BlogCategoryTranslateDrawerForm
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
