import { RotateCcwIcon } from 'lucide-react';
import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { ColorPickerPopover } from '@/components/custom/ColorPickerPopover';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import {
    COLOR_PRESETS,
    DEFAULT_PRIMARY_COLOR,
    DEFAULT_SECONDARY_COLOR,
    SETTINGS_FIELDS,
    type SettingField,
} from '../../settings-form';

type CustomColorProps = {
    primaryColor: string;
    setPrimaryColor: Dispatch<SetStateAction<string>>;
    secondaryColor: string;
    setSecondaryColor: Dispatch<SetStateAction<string>>;
    defaultPrimaryColor?: string;
    defaultSecondaryColor?: string;
    errors: Record<string, string>;
};

const renderSettingInputs = (
    field: SettingField,
    value: string,
    errors: Record<string, string>,
) => (
    <>
        <Input
            type="hidden"
            name={`settings[${field.index}][key]`}
            value={field.key}
        />
        <Input
            type="hidden"
            name={`settings[${field.index}][value]`}
            value={value}
            readOnly
        />
        <Input
            type="hidden"
            name={`settings[${field.index}][type]`}
            value={field.type}
        />
        <InputError message={errors?.[`settings.${field.index}.value`]} />
        <InputError message={errors?.[`settings.${field.index}.type`]} />
    </>
);

export default function CustomColor({
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    defaultPrimaryColor = DEFAULT_PRIMARY_COLOR,
    defaultSecondaryColor = DEFAULT_SECONDARY_COLOR,
    errors,
}: CustomColorProps) {
    const selectedPreset = COLOR_PRESETS.findIndex(
        (preset) =>
            preset.primary.toLowerCase() === primaryColor.toLowerCase() &&
            preset.secondary.toLowerCase() === secondaryColor.toLowerCase(),
    );

    const resetColors = () => {
        setPrimaryColor(defaultPrimaryColor);
        setSecondaryColor(defaultSecondaryColor);
    };

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty(
            '--secondary',
            secondaryColor,
        );
        document.documentElement.style.setProperty(
            '--color-primary',
            primaryColor,
        );
        document.documentElement.style.setProperty(
            '--color-secondary',
            secondaryColor,
        );
        document.documentElement.style.setProperty(
            '--sidebar-primary',
            primaryColor,
        );
    }, [primaryColor, secondaryColor]);

    return (
        <section className="space-y-4">
            <Collapsible>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-semibold">الألوان</h4>
                        <p className="text-sm text-muted-foreground">
                            اختر الألوان الأساسية أو عدّلها يدويًا.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                                يدوي
                            </Button>
                        </CollapsibleTrigger>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={resetColors}
                            aria-label="إعادة ضبط الألوان"
                        >
                            <RotateCcwIcon className="size-4" />
                        </Button>
                    </div>
                </div>

                <CollapsibleContent className="mt-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-md border p-3">
                            <ColorPickerPopover
                                defaultValue={primaryColor}
                                value={primaryColor}
                                onChange={(_value, hex) => setPrimaryColor(hex)}
                            />
                            <span className="text-sm font-medium">
                                اللون الأساسي
                            </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-3">
                            <ColorPickerPopover
                                defaultValue={secondaryColor}
                                value={secondaryColor}
                                onChange={(_value, hex) =>
                                    setSecondaryColor(hex)
                                }
                            />
                            <span className="text-sm font-medium">
                                اللون الثانوي
                            </span>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
                <h5 className="text-sm font-medium">ألوان مقترحة</h5>
                <ToggleGroup
                    type="single"
                    value={
                        selectedPreset >= 0 ? String(selectedPreset) : undefined
                    }
                    onValueChange={(value) => {
                        const preset = COLOR_PRESETS[Number(value)];

                        if (preset) {
                            setPrimaryColor(preset.primary);
                            setSecondaryColor(preset.secondary);
                        }
                    }}
                    aria-label="ألوان مقترحة"
                    className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4"
                >
                    {COLOR_PRESETS.map((preset, index) => (
                        <ToggleGroupItem
                            key={preset.label}
                            value={String(index)}
                            aria-label={preset.label}
                            title={preset.label}
                            className="h-11 overflow-hidden rounded-md border p-0 data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-1"
                        >
                            <span
                                className="block size-7 rounded-full"
                                style={{
                                    background: `linear-gradient(135deg, ${preset.primary} 50%, ${preset.secondary} 50%)`,
                                }}
                            />
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            {renderSettingInputs(
                SETTINGS_FIELDS.primaryColor,
                primaryColor,
                errors,
            )}
            {renderSettingInputs(
                SETTINGS_FIELDS.secondaryColor,
                secondaryColor,
                errors,
            )}
        </section>
    );
}
