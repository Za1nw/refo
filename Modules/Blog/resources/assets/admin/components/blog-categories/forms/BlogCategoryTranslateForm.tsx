import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { useDirection } from '@/components/ui/direction';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useBlogCategoryTranslateDrawerForm } from '../../../hooks/blog-categories/useBlogCategoryTranslateDrawerForm';
import type { BlogCategory } from '../../../type';

export default function BlogCategoryTranslateDrawerForm({
    open,
    item,
    onOpenChange,
    onSaved,
}: {
    open: boolean;
    item: BlogCategory | null;
    onOpenChange: (open: boolean) => void;
    onSaved?: (category: BlogCategory) => void;
}) {
    const { t, i18n } = useTranslation('blog');
    const dir = useDirection();

    const {
        processing,
        loading,
        errors,
        locale,
        setLocale,
        name,
        setName,
        description,
        setDescription,
        submit,
        resetAndClose,
    } = useBlogCategoryTranslateDrawerForm({ open, item, onOpenChange, onSaved });

    const title = t('translate_category');

    return (
        <Drawer direction={dir === 'rtl' ? 'left' : 'right'} open={open} onOpenChange={onOpenChange}>
            <DrawerContent dir="ltr" data-lang={dir === 'rtl' ? i18n.language : undefined}>
                <div dir={dir} className="flex h-full flex-col">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>{item?.name ?? ''}</DrawerDescription>
                    </DrawerHeader>

                    <form className="flex h-full flex-col" onSubmit={submit}>
                        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
                            <div className="grid gap-5">
                                <div className="grid gap-3">
                                    <Label htmlFor="blog-category-translation-locale">{t('translation_locale')}</Label>
                                    <Input
                                        id="blog-category-translation-locale"
                                        name="locale"
                                        value={locale}
                                        onChange={(event) => setLocale(event.currentTarget.value)}
                                    />
                                    <InputError message={errors.locale} />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="blog-category-translation-name" className="required-label">
                                        {t('translation_name')}
                                    </Label>
                                    <Input
                                        id="blog-category-translation-name"
                                        name="name"
                                        value={name}
                                        onChange={(event) => setName(event.currentTarget.value)}
                                        disabled={loading}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="blog-category-translation-description">{t('translation_description')}</Label>
                                    <Textarea
                                        id="blog-category-translation-description"
                                        name="description"
                                        rows={5}
                                        value={description}
                                        onChange={(event) => setDescription(event.currentTarget.value)}
                                        disabled={loading}
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>
                        </div>

                        <DrawerFooter>
                            <Button type="submit" disabled={processing || loading}>
                                {processing ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : null}
                                {title}
                            </Button>

                            <DrawerClose asChild>
                                <Button type="button" variant="outline" onClick={resetAndClose} disabled={processing || loading}>
                                    {t('Cancel')}
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
