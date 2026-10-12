import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

/**
 * مكون الحالة الفارغة (Empty State) لجدول وقوائم المدونات:
 * يظهر عند عدم وجود بيانات مع زر اختياري لإنشاء مدونة جديدة.
 */
export default function BlogEmptyState({ onCreate }: { onCreate?: () => void }) {
    const { t } = useTranslation('blog');

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-xl font-semibold text-muted-foreground">{t('empty_news_title')}</div>
            <div className="mt-2 text-sm text-muted-foreground">{t('empty_news_message')}</div>
            {onCreate ? (
                <div className="mt-4">
                    <Button onClick={onCreate} variant="default">
                        {t('Create')}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
