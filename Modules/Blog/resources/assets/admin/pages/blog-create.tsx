import { index } from '@/routes/blog';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import BlogFormPage from '../components/blogs/BlogFormPage';

export default function BlogCreate() {
    const { t } = useTranslation('blog');

    return (
        <>
            <Head title={t('Create')} />
            <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                <BlogFormPage mode="create" />
            </div>
        </>
    );
}


BlogCreate.layout = {
    breadcrumbs: [
        { title: 'title', href: index().url, namespace: "blog" },
        { title: 'Create', href: '#', namespace: "blog" },
    ]
}
