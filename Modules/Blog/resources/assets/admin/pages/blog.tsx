
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { NotebookPen } from 'lucide-react';

import SectionListBlogs from '../components/blogs/SectionListBlogs';

export default function Blogs() {
    const { t } = useTranslation('blog');

    return (
        <>
            <Head title={t('title')} />
            <div className="relative p-4 md:p-6">
                <div className="mb-5 rounded-2xl border bg-linear-to-l from-primary/15 to-primary/5 p-5 shadow-sm md:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t('manage_title')}</h2>
                            <p className="text-sm text-muted-foreground">{t('manage_subtitle')}</p>
                        </div>
                        <div className="rounded-xl bg-primary/15 p-2 text-primary">
                            <NotebookPen className="h-5 w-5" />
                        </div>
                    </div>
                </div>
                <div className="@container/main relative z-10 flex flex-col gap-4 md:gap-6">
                    <SectionListBlogs />
                </div>
            </div>
        </>
    );
}

Blogs.layout = {
    breadcrumbs: [
        {
            title: 'title',
            href: '#',
            namespace: "blog"
        },
    ]
}
