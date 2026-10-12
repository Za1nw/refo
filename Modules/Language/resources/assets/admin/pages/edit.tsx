import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import TranslationEditorForm from '../components/TranslationEditorForm';
import type { TranslationEditorProps } from '../types';

export default function LangEditPage(props: TranslationEditorProps) {
    const { t } = useTranslation('language');

    return (
        <>
            <Head title={`${t('edit_translation')}: ${props.file.label}`} />
            <TranslationEditorForm {...props} />
        </>
    );
}

LangEditPage.layout = {
    breadcrumbs: [
        {
            title: 'title',
            href: '/admin/hidden/languages',
            namespace: 'language',
        },
        {
            title: 'edit_translation',
            href: '#',
            namespace: 'language',
        },
    ],
};
