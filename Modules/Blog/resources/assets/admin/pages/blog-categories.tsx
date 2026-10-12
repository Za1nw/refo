import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SectionListBlogCategories from '../components/blog-categories/SectionListBlogCategories';

export default function BlogCategories() {
    const { t } = useTranslation('blog');

    return (
        <>
            <Head title={t('Manage categories')} />
            <div className="relative">
                <div className="absolute z-0 h-32 w-full rounded-b-md rounded-bl-md bg-primary p-4 md:p-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-background">{t('Manage categories')}</h2>
                </div>
                <div className="@container/main relative z-10 mt-16 flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                    <SectionListBlogCategories />
                </div>
            </div>
        </>
    );
}

BlogCategories.layout = {
    breadcrumbs: [
        {
            title: 'Manage categories',
            href: '#',
            namespace: 'blog',
        },
    ],
};
