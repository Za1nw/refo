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
import { Switch } from '@/components/ui/switch';

import { useBlogTagDrawerForm } from '../../../hooks/blog-tags/useBlogTagDrawerForm';
import type { BlogTag } from '../../../type';

export default function BlogTagDrawerForm({
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
    const { t: tMain } = useTranslation('main');
    const dir = useDirection();

    const {
        processing,
        errors,
        isActive,
        setIsActive,
        submit,
        resetAndClose,
    } = useBlogTagDrawerForm({ open, item, onOpenChange, onSaved });

    const isEditing = !!item;
    const title = isEditing ? t('edit_tag') : t('add_tag');

    return (
        <Drawer direction={dir === 'rtl' ? 'left' : 'right'} open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
            <DrawerContent dir="ltr" data-lang={dir === 'rtl' ? i18n.language : undefined} aria-labelledby="blog-tag-drawer-title">
                <div dir={dir} className="flex h-full flex-col">
                    <DrawerHeader>
                        <DrawerTitle id="blog-tag-drawer-title">{title}</DrawerTitle>
                        <DrawerDescription className="sr-only">
                            {isEditing ? t('drawer_description_edit') : t('drawer_description_create')}
                        </DrawerDescription>
                    </DrawerHeader>

                    <form className="flex h-full flex-col" onSubmit={submit} noValidate>
                        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="blog-tag-name" className="required-label">
                                        {t('column_name')}
                                    </Label>
                                    <Input
                                        id="blog-tag-name"
                                        name="name"
                                        defaultValue={item?.name ?? ''}
                                        required
                                        aria-invalid={!!errors.name}
                                        aria-describedby={errors.name ? 'blog-tag-name-error' : undefined}
                                        autoComplete="off"
                                    />
                                    {errors.name && <InputError id="blog-tag-name-error" message={errors.name} />}
                                </div>

                                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3">
                                    <div className="grid gap-1">
                                        <Label htmlFor="blog-tag-is-active">{t('column_is_active')}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {isActive ? t('active') : t('inactive')}
                                        </p>
                                    </div>

                                    <input type="hidden" name="is_active" value={isActive ? '1' : '0'} />
                                    <Switch
                                        id="blog-tag-is-active"
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                        aria-label={t('column_is_active')}
                                    />
                                </div>
                            </div>
                        </div>

                        <DrawerFooter className="gap-3">
                            <Button type="submit" disabled={processing} className="w-full">
                                {processing && <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                                {title}
                            </Button>

                            <DrawerClose asChild>
                                <Button type="button" variant="outline" onClick={resetAndClose} className="w-full" disabled={processing}>
                                    {tMain('Cancel')}
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
