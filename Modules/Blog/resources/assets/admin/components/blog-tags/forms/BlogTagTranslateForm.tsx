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
import { LoaderCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useBlogTagTranslateDrawerForm } from '../../../hooks/blog-tags/useBlogTagTranslateDrawerForm';
import type { BlogTag } from '../../../type';

export default function BlogTagTranslateDrawerForm({
    open,
    item,
    onOpenChange,
    onSaved,
}: {
    open: boolean;
    item: BlogTag | null;
    onOpenChange: (open: boolean) => void;
    onSaved?: (tag: BlogTag) => void;
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
        submit,
        resetAndClose,
    } = useBlogTagTranslateDrawerForm({ open, item, onOpenChange, onSaved });

    const title = t('translate_tag');

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
                                    <Label htmlFor="blog-tag-translation-locale">{t('translation_locale')}</Label>
                                    <Input
                                        id="blog-tag-translation-locale"
                                        name="locale"
                                        value={locale}
                                        onChange={(event) => setLocale(event.currentTarget.value)}
                                    />
                                    <InputError message={errors.locale} />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="blog-tag-translation-name" className="required-label">
                                        {t('translation_name')}
                                    </Label>
                                    <Input
                                        id="blog-tag-translation-name"
                                        name="name"
                                        value={name}
                                        onChange={(event) => setName(event.currentTarget.value)}
                                        disabled={loading}
                                        required
                                    />
                                    <InputError message={errors.name} />
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
