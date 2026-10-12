import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import {
    DEFAULT_MENU_STYLE,
    MENU_STYLE_OPTIONS,
    SETTINGS_FIELDS,
    type MenuStyleOption,
} from '../../settings-form';

type MenuStyleProps = {
    value?: MenuStyleOption;
    defaultValue?: MenuStyleOption;
    onChange?: (value: MenuStyleOption) => void;
    errors?: Record<string, string>;
};

const storageKey = 'ui:menuStyle';

const isMenuStyleOption = (value: unknown): value is MenuStyleOption =>
    typeof value === 'string' &&
    MENU_STYLE_OPTIONS.some((option) => option.key === value);

export default function MenuStyle({
    value,
    defaultValue = DEFAULT_MENU_STYLE,
    onChange,
    errors = {},
}: MenuStyleProps) {
    const readInitialValue = (): MenuStyleOption => {
        if (value) {
            return value;
        }

        if (
            typeof window !== 'undefined' &&
            isMenuStyleOption(window.__menuStyle)
        ) {
            return window.__menuStyle;
        }

        return defaultValue;
    };

    const [selected, setSelected] = useState<MenuStyleOption>(readInitialValue);
    const field = SETTINGS_FIELDS.menuStyle;

    useEffect(() => {
        if (value !== undefined) {
            setSelected(value);
        }
    }, [value]);

    useEffect(() => {
        const handler = (event: StorageEvent) => {
            if (event.key === storageKey && isMenuStyleOption(event.newValue)) {
                setSelected(event.newValue);
            }
        };

        window.addEventListener('storage', handler);

        return () => window.removeEventListener('storage', handler);
    }, []);

    const handleSelect = (nextValue: string) => {
        if (!isMenuStyleOption(nextValue)) {
            return;
        }

        if (value === undefined) {
            setSelected(nextValue);
        }

        localStorage.setItem(storageKey, nextValue);
        window.dispatchEvent(
            new CustomEvent('ui:menuStyleChange', { detail: nextValue }),
        );
        onChange?.(nextValue);
    };

    return (
        <section className="space-y-2">
            <div>
                <h4 className="text-sm font-semibold">نمط القائمة</h4>
                <p className="text-sm text-muted-foreground">
                    حدد طريقة ظهور القائمة الجانبية داخل لوحة التحكم.
                </p>
            </div>

            <ToggleGroup
                type="single"
                value={selected}
                onValueChange={handleSelect}
                aria-label="نمط القائمة"
                className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3"
            >
                {MENU_STYLE_OPTIONS.map((option) => (
                    <ToggleGroupItem
                        key={option.key}
                        value={option.key}
                        aria-label={option.label}
                        className="w-full rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                        {option.label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>

            <Input
                type="hidden"
                name={`settings[${field.index}][key]`}
                value={field.key}
            />
            <Input
                type="hidden"
                name={`settings[${field.index}][value]`}
                value={selected}
                readOnly
            />
            <Input
                type="hidden"
                name={`settings[${field.index}][type]`}
                value={field.type}
            />
            <InputError message={errors?.[`settings.${field.index}.value`]} />
            <InputError message={errors?.[`settings.${field.index}.type`]} />
        </section>
    );
}
