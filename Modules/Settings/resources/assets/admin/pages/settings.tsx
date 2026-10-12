import { Form, Head, usePage } from '@inertiajs/react';
import { Loader2Icon, SaveIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { store } from '@/routes/settings';
import MenuSettings from '@settings/components/MenuSettings';
import { SCREEN, SettingsScreen } from '@settings/settings-form';


export default function SettingsPage() {
    const { t } = useTranslation('settings');
    const pageTitle = t('settings', { defaultValue: 'الإعدادات' });
    const { screen } = usePage().props;

    const ActiveScreen = SCREEN[screen as SettingsScreen];

    return (
        <>
            <Head title={pageTitle} />

            <div className="relative">
                <div className="absolute z-0 h-32 w-full rounded-b-md bg-primary p-4 md:p-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-background">
                        {pageTitle}
                    </h2>
                </div>

                <div className="@container/main relative z-10 mt-16 flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                    <div className="grid w-full gap-4 md:gap-6 lg:grid-cols-[280px_1fr]">
                        <MenuSettings
                        />

                        <Form
                            {...store.form()}
                            errorBag="customization"
                            showProgress={false}
                            disableWhileProcessing
                        >
                            {({ errors, processing, wasSuccessful }) => (
                                <Card className="w-full rounded-md">
                                    <ActiveScreen
                                        errors={errors}
                                        wasSuccessful={wasSuccessful}
                                    />

                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="gap-2"
                                        >
                                            {processing ? (
                                                <>
                                                    <span>جاري الحفظ...</span>
                                                    <Loader2Icon className="size-4 animate-spin" />
                                                </>
                                            ) : (
                                                <>
                                                    <span>حفظ</span>
                                                    <SaveIcon className="size-4" />
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}


SettingsPage.layout = {
    breadcrumbs: [
        {
            title: "الاعدادات",
            href: '#',
        },
    ],
};
