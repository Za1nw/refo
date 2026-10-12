import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBlogFormContext } from '../../../context/BlogFormContext';

export default function GeneralSection() {
    const { form, t } = useBlogFormContext();

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="blog-title">{t('Title')}</Label>
                <Input
                    id="blog-title"
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.currentTarget.value)}
                    autoComplete="off"
                />
                {form.errors.title ? <p className="text-sm text-destructive">{form.errors.title}</p> : null}
            </div>
        </div>
    );
}
