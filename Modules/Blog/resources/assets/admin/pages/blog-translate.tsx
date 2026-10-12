import { index } from '@/routes/blog';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import TiptapEditor from '@/components/tiptap/TiptapEditor';
import { ToolbarAction } from '@/components/tiptap/EditorToolbar';
import { LoaderCircleIcon } from 'lucide-react';
import React from 'react';

const DEFAULT_ACTIONS: ToolbarAction[] = [
    'undoRedo',
    'heading',
    'fontSize',
    'textFormat',
    'textColor',
    'backgroundColor',
    'align',
    'textDirection',
    'list',
    'link',
    'preview',
    'fullscreen',
];

export default function BlogTranslate() {
    const { t } = useTranslation('blog');
    const page = usePage();
    const blog = (page.props.blog ?? null) as any;
    const translations = (page.props.translations ?? null) as {
        locale?: string;
        title?: string;
        description?: string;
        content?: string;
    } | null;

    const form = useForm({
        title: translations?.title ?? '',
        description: translations?.description ?? '',
        content: translations?.content ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!blog) return;
        router.post(`${index().url}/${blog.id}/translate`, form.data, { preserveScroll: true });
    };

    return (
        < >
            <Head title={`${t('Translate')} - ${blog?.title ?? ''}`} />
            <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div className="sticky top-0 z-20 rounded-xl border bg-background/90 p-3 shadow-sm backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold leading-none md:text-lg">{t('Translate')}</h2>
                            <p className="mt-1 text-xs text-muted-foreground md:text-sm">{blog?.title ?? ''}</p>
                        </div>
                        <Button type="submit" form="blog-translate-form" disabled={form.processing} className="min-w-36">
                            {form.processing ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : null}
                            {t('Save Translation')}
                        </Button>
                    </div>
                </div>

                <form id="blog-translate-form" onSubmit={submit} className="grid gap-4 @4xl:grid-cols-[1fr_2fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{t('Basic translation')}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">{t('Title (English)')}</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.currentTarget.value)}
                                />
                                <InputError message={form.errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">{t('Description (English)')}</Label>
                                <Textarea
                                    id="description"
                                    rows={8}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.currentTarget.value)}
                                />
                                <InputError message={form.errors.description} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{t('Content (English)')}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <TiptapEditor
                                toolbarActions={DEFAULT_ACTIONS}
                                onChange={(value) => form.setData('content', value)}
                                value={form.data.content}
                                maxHeight={420}
                            />
                            <InputError message={form.errors.content} />
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

BlogTranslate.layout = {
    breadcrumbs: [
        {
            title: 'title',
            href: index().url,
            namespace: "blog"
        },
        {
            title:'Translate',
            href: '#',
            namespace: "blog"
        }
    ]
}

