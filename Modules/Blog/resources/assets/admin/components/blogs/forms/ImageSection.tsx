import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { useBlogFormContext } from '../../../context/BlogFormContext';

export default function ImageSection() {
    const { blog, form, t } = useBlogFormContext();
    const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (!form.data.image) {
            console.log(blog);

            setSelectedImagePreview(blog?.image?.medium ?? blog?.image?.url ?? null);
            return;
        }

        const previewUrl = URL.createObjectURL(form.data.image);
        setSelectedImagePreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [blog?.image?.medium, blog?.image?.url, form.data.image]);

    return (
        <div className="grid gap-2">
            <Label htmlFor="blog-image">{t('Image')}</Label>
            <div className="grid gap-3 rounded-xl border border-dashed bg-muted/20 p-4">
                {selectedImagePreview ? (
                    <div className="overflow-hidden rounded-lg border bg-background">
                        <img src={selectedImagePreview} alt={t('Image')} className="h-52 w-full object-cover" />
                    </div>
                ) : (
                    <div className="flex h-52 items-center justify-center rounded-lg border bg-background text-sm text-muted-foreground">
                        {t('No image selected')}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <Label
                        htmlFor="blog-image"
                        className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
                    >
                        {t('Choose image')}
                    </Label>
                    <Input
                        id="blog-image"
                        type="file"
                            accept="image/png,image/jpg,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => form.setData('image', e.currentTarget.files?.[0] ?? null)}
                    />
                    {form.data.image ? (
                        <Button type="button" variant="ghost" onClick={() => form.setData('image', null)}>
                            {t('Remove image')}
                        </Button>
                    ) : null}
                </div>

                <p className="text-xs text-muted-foreground">{t('Image help')}</p>
            </div>
            {form.errors.image ? <p className="text-sm text-destructive">{form.errors.image}</p> : null}
        </div>
    );
}
