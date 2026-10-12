import { Head } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import TranslationFilesTable from '../components/TranslationFilesTable';
import type { TranslationFilesIndexProps } from '../types';

export default function LangPage({ files, filters, locales, indexUrl }: TranslationFilesIndexProps) {
    const { t } = useTranslation('language');

    return (
        <>
            <Head title={t('title')} />

            <div className="relative p-4 md:p-6 space-y-6">
                <div className="rounded-2xl border bg-linear-to-l from-primary/15 to-primary/5 p-5 shadow-xs md:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 text-start">
                            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                                {t('files_management')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t('subtitle')}
                            </p>
                        </div>
                        <div className="rounded-xl bg-primary/15 p-2 text-primary">
                            <Languages className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <TranslationFilesTable
                    files={files.data}
                    filters={filters}
                    locales={locales}
                    indexUrl={indexUrl}
                    pagination={files.meta}
                />
            </div>
        </>
    );
}

LangPage.layout = {
    breadcrumbs: [
        {
            title: 'title',
            href: '#',
            namespace: 'language',
        },
    ],
};
