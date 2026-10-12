import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBlogFormContext } from '../../../context/BlogFormContext';

export default function StatusSection() {
    const { form, t } = useBlogFormContext();

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1">
                <Label htmlFor="blog-active">{t('Status')}</Label>
                <p className="text-sm text-muted-foreground">{Boolean(form.data.is_active) ? t('Active') : t('Inactive')}</p>
            </div>

            <Switch
                id="blog-active"
                checked={Boolean(form.data.is_active)}
                onCheckedChange={(checked) => form.setData('is_active', checked ? 1 : 0)}
            />
        </div>
    );
}
