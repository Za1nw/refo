import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SectionListBlogTags from '../components/blog-tags/SectionListBlogTags';

export default function BlogTags() {
    const { t } = useTranslation('blog');

    return (
        <>
            <Head title={t('Manage tags')} />
            <div className="relative">
                <div className="absolute z-0 h-32 w-full rounded-b-md rounded-bl-md bg-primary p-4 md:p-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-background">{t('Manage tags')}</h2>
                </div>
                <div className="@container/main relative z-10 mt-16 flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                    <SectionListBlogTags />
                </div>
            </div>
        </>
    );
}

BlogTags.layout = {
    breadcrumbs: [
        {
            title: 'Manage tags',
            href: '#',
            namespace: 'blog',
        },
    ],
};
