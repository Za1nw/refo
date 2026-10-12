import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import {
    Combobox,
    ComboboxInput,
    ComboboxValue,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    useComboboxAnchor,
} from '@/components/ui/combobox';
import api from '@/lib/axios';
import { useEffect, useMemo, useState } from 'react';
import categories from '@/routes/blog/categories';
import { saveCategory } from '../../../services/blog_category.service';
import { useBlogFormContext } from '../../../context/BlogFormContext';

type CategoryOption = { id: number; name: string };

function normalizeName(value: unknown): string {
    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                const parsed = JSON.parse(trimmed) as Record<string, unknown>;
                const fromObject = parsed.ar ?? parsed.en ?? Object.values(parsed).find((entry) => typeof entry === 'string');

                return typeof fromObject === 'string' ? fromObject : trimmed;
            } catch {
                return trimmed;
            }
        }

        return trimmed;
    }

    if (value && typeof value === 'object') {
        const parsed = value as Record<string, unknown>;
        const fromObject = parsed.ar ?? parsed.en ?? Object.values(parsed).find((entry) => typeof entry === 'string');

        return typeof fromObject === 'string' ? fromObject : '';
    }

    return '';
}

export default function CategorySection() {
    const { form, t } = useBlogFormContext();
    const anchor = useComboboxAnchor();

    const categoriesUrl = useMemo(() => categories.index().url, []);

    const [items, setItems] = useState<CategoryOption[]>([]);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddName, setQuickAddName] = useState('');
    const [quickAddLoading, setQuickAddLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await api.get(categoriesUrl);
                const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
                if (!mounted) return;
                setItems(data.map((r: any) => ({ id: Number(r.id), name: normalizeName(r.name) })));
            } catch (e) {
                console.error(e);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [categoriesUrl]);

    const selected = useMemo(() => {
        const id = Number(form.data.category_id ?? 0);
        return items.find((x) => x.id === id) ?? null;
    }, [items, form.data.category_id]);

    const handleQuickAdd = async () => {
        const name = quickAddName.trim();
        if (!name) return;

        try {
            setQuickAddLoading(true);
            const created = await saveCategory(null, { name, is_active: true });
            if (!created) return;
            const opt = { id: Number(created.id), name: normalizeName(created.name) || name };
            setItems((s) => [opt, ...s]);
            form.setData('category_id', opt.id);
            setQuickAddName('');
            setIsQuickAddOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setQuickAddLoading(false);
        }
    };

    return (
        <div className="grid gap-2">
            <Label htmlFor="blog-category">{t('Category')}</Label>
            <Combobox
                items={items}
                filteredItems={items}
                itemToStringLabel={(item) => String(item.name ?? '')}
                value={selected ?? null}
                onValueChange={(value) => {
                    const id = typeof value === 'object' && value != null ? Number((value as any).id ?? 0) : Number(value ?? 0);
                    form.setData('category_id', id);
                }}
            >
                <div ref={anchor}>
                    <ComboboxInput placeholder={t('Select...')} showTrigger />
                </div>
                <ComboboxValue>
                    {(val: any) => (val ? normalizeName(val.name) : '')}
                </ComboboxValue>
                <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>
                        <div className="p-3 text-sm text-muted-foreground">{t('No categories found')}</div>
                    </ComboboxEmpty>
                    <ComboboxList className="scrollbar">
                        {(item) => (
                            <ComboboxItem key={String(item.id)} value={item}>
                                {String(item.name ?? '')}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
            <InputError message={form.errors.category_id} />
            <div className="flex items-center justify-between">
                <a href={categoriesUrl} className="text-sm text-primary underline">
                    {t('Manage categories')}
                </a>
                <Button type="button" size="sm" onClick={() => setIsQuickAddOpen(true)}>
                    {t('Quick add')}
                </Button>
            </div>

            <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Add category')}</DialogTitle>
                        <DialogDescription>{t('Create a new category quickly without leaving this form.')}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="quick-add-category-name">{t('Category name')}</Label>
                        <Input
                            id="quick-add-category-name"
                            value={quickAddName}
                            onChange={(event) => setQuickAddName(event.target.value)}
                            placeholder={t('Enter category name')}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    void handleQuickAdd();
                                }
                            }}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsQuickAddOpen(false)} disabled={quickAddLoading}>
                            {t('Cancel')}
                        </Button>
                        <Button type="button" onClick={() => void handleQuickAdd()} disabled={quickAddLoading || quickAddName.trim().length === 0}>
                            {quickAddLoading ? t('Saving...') : t('Save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
