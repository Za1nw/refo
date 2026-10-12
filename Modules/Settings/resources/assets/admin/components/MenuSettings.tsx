import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { SETTINGS_MENU_ITEMS, type SettingsScreen } from '../settings-form';
import { Link, usePage } from '@inertiajs/react';
import { index } from '@/routes/settings';

type MenuSettingsProps = {
    activeScreen: SettingsScreen;
    onScreenChange: (screen: SettingsScreen) => void;
};

export default function MenuSettings() {
    const { screen } = usePage().props;

    return (
        <Card className="h-fit rounded-md">
            <CardContent>
                <nav aria-label="قائمة الإعدادات">
                    <ul className="flex flex-col gap-2">
                        {SETTINGS_MENU_ITEMS.map((item) => (
                            <li key={item.screen}>
                                <Link
                                href={index(item.screen)}
                                disabled={screen === item.screen}
                                >
                                    <Button
                                        type="button"
                                        variant={
                                            screen === item.screen
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className="w-full justify-start rounded-sm transition-colors duration-200"
                                    >
                                        <item.icon className="size-4" />
                                        <span>{item.title}</span>
                                    </Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </CardContent>
        </Card>
    );
}
