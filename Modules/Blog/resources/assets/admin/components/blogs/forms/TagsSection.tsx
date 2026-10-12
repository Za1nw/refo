import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/combobox';
import api from '@/lib/axios';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import tags from '@/routes/blog/tags';
import { saveTag } from '../../../services/blog_tag.service';
import { useBlogFormContext } from '../../../context/BlogFormContext';

type TagOption = { id: number; name: string };

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

export default function TagsSection() {
    const { form, t } = useBlogFormContext();
    const anchor = useComboboxAnchor();

    const tagsUrl = useMemo(() => tags.index().url, []);

    const [items, setItems] = useState<TagOption[]>([]);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddName, setQuickAddName] = useState('');
    const [quickAddLoading, setQuickAddLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await api.get(tagsUrl);
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
    }, [tagsUrl]);

    const selectedTagIdSet = useMemo(
        () => new Set((form.data.tag_ids ?? []).map((id: number | string) => Number(id))),
        [form.data.tag_ids],
    );

    const selectedTagObjects = useMemo(
        () => items.filter((tag) => selectedTagIdSet.has(Number(tag.id))),
        [items, selectedTagIdSet],
    );

    const handleQuickAdd = async () => {
        const name = quickAddName.trim();
        if (!name) return;

        try {
            setQuickAddLoading(true);
            const created = await saveTag(null, { name, is_active: true });
            if (!created) return;
            const opt = { id: Number(created.id), name: normalizeName(created.name) || name };
            setItems((s) => [opt, ...s]);
            form.setData('tag_ids', Array.from(new Set([...(form.data.tag_ids ?? []), opt.id])));
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
            <Label htmlFor="blog-tags">{t('Tags')}</Label>
            <Combobox
                multiple
                items={items}
                filteredItems={items}
                value={selectedTagObjects}
                onValueChange={(values) => {
                    const ids = Array.isArray(values)
                        ? values.map((v: any) => Number(v.id ?? 0)).filter((id) => id > 0)
                        : [];
                    form.setData('tag_ids', ids);
                }}
            >
                <ComboboxChips ref={anchor} className="w-full">
                    <ComboboxValue placeholder={t('Select...')}>
                        {(vals: any[]) => (
                            <>
                                {vals.map((v) => (
                                    <ComboboxChip key={String(v.id)}>
                                        {String(v.name ?? '')}
                                    </ComboboxChip>
                                ))}
                                <ComboboxChipsInput />
                            </>
                        )}
                    </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>
                        <div className="p-3 text-sm text-muted-foreground">{t('No tags found')}</div>
                    </ComboboxEmpty>
                    <ComboboxList className="scrollbar">
                        {(item) => (
                            <ComboboxItem key={String((item as TagOption).id)} value={item}>
                                {String((item as TagOption).name ?? '')}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
            <InputError message={form.errors.tag_ids} />
            <div className="flex items-center justify-between">
                <a href={tagsUrl} className="text-sm text-primary underline">
                    {t('Manage tags')}
                </a>
                <Button type="button" size="sm" onClick={() => setIsQuickAddOpen(true)}>
                    {t('Quick add')}
                </Button>
            </div>

            <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Add tag')}</DialogTitle>
                        <DialogDescription>{t('Create a new tag quickly without leaving this form.')}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="quick-add-tag-name">{t('Tag name')}</Label>
                        <Input
                            id="quick-add-tag-name"
                            value={quickAddName}
                            onChange={(event) => setQuickAddName(event.target.value)}
                            placeholder={t('Enter tag name')}
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
