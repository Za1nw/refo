import { RotateCcwIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

import { DEFAULT_RADIUS, SETTINGS_FIELDS } from '../../settings-form';

type RadiusControlProps = {
    storageKey?: string;
    min?: number;
    max?: number;
    onChange?: (value: number) => void;
    className?: string;
    errors?: Record<string, string>;
};

const readCssRadius = () => {
    const radius = getComputedStyle(document.documentElement)
        .getPropertyValue('--radius')
        .trim();

    if (!radius.endsWith('rem')) {
        return null;
    }

    const parsedRadius = Number.parseFloat(radius.replace('rem', '').trim());

    return Number.isNaN(parsedRadius) ? null : parsedRadius;
};

export default function RadiusControl({
    storageKey = 'ui:radius',
    min = 0.25,
    max = 1.5,
    onChange,
    className,
    errors = {},
}: RadiusControlProps) {
    const [radius, setRadius] = useState(DEFAULT_RADIUS);
    const field = SETTINGS_FIELDS.radius;
    const sliderValue = Math.round(((radius - min) / (max - min)) * 100);

    const updateRadius = (value: number, persist = true) => {
        const clampedValue = Math.min(max, Math.max(min, value));
        const roundedValue = Number.parseFloat(clampedValue.toFixed(3));

        setRadius(roundedValue);
        document.documentElement.style.setProperty(
            '--radius',
            `${roundedValue}rem`,
        );

        if (persist) {
            localStorage.setItem(storageKey, String(roundedValue));
        }

        onChange?.(roundedValue);
    };

    useEffect(() => {
        const initialRadius =
            typeof window.__radius === 'number'
                ? window.__radius
                : readCssRadius();

        if (initialRadius !== null && initialRadius !== undefined) {
            updateRadius(initialRadius, false);
        }
    }, []);

    const resetRadius = () => {
        localStorage.removeItem(storageKey);
        updateRadius(DEFAULT_RADIUS, false);
    };

    return (
        <div className={className}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Slider
                    value={[sliderValue]}
                    max={100}
                    step={1}
                    onValueChange={(values: number[] | number) => {
                        const value = Array.isArray(values)
                            ? values[0]
                            : values;
                        const nextRadius = min + (value / 100) * (max - min);

                        updateRadius(nextRadius);
                    }}
                    className="w-full"
                />

                <div className="flex items-center gap-2 sm:w-40">
                    <Input
                        type="number"
                        name={`settings[${field.index}][value]`}
                        value={radius}
                        min={min}
                        max={max}
                        step={0.001}
                        onChange={(event) => {
                            const nextRadius = Number.parseFloat(
                                event.target.value,
                            );

                            if (!Number.isNaN(nextRadius)) {
                                updateRadius(nextRadius);
                            }
                        }}
                    />
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={resetRadius}
                        aria-label="إعادة ضبط الحواف"
                    >
                        <RotateCcwIcon className="size-4" />
                    </Button>
                </div>
            </div>

            <Input
                type="hidden"
                name={`settings[${field.index}][key]`}
                value={field.key}
            />
            <Input
                type="hidden"
                name={`settings[${field.index}][type]`}
                value={field.type}
            />
            <InputError message={errors?.[`settings.${field.index}.value`]} />
            <InputError message={errors?.[`settings.${field.index}.type`]} />
        </div>
    );
}
