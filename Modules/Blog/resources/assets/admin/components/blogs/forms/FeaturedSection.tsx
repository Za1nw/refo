import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBlogFormContext } from '../../../context/BlogFormContext';

export default function FeaturedSection() {
    const { form, t } = useBlogFormContext();

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1">
                <Label htmlFor="blog-featured">{t('Featured')}</Label>
                <p className="text-sm text-muted-foreground">{t('Featured help')}</p>
            </div>

            <Switch
                id="blog-featured"
                checked={Boolean(form.data.is_featured)}
                onCheckedChange={(checked) => form.setData('is_featured', checked ? 1 : 0)}
            />
        </div>
    );
}
