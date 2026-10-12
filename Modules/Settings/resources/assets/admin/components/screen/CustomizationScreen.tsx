import {
    DEFAULT_PRIMARY_COLOR,
    DEFAULT_SECONDARY_COLOR,
} from '../../settings-form';

import CustomColor from '../ui/CustomColor';
import MenuStyle from '../ui/MenuStyle';
import ThemeControls from '../ui/ThemeControls';
import { oklchToRgbMath } from '../../oklchToRgbMath';
import { CardContent, CardHeader } from '@/components/ui/card';
import { SwatchBook } from 'lucide-react';
import { useState } from 'react';


const readCssColorVariable = (name: string, fallback: string) => {
    if (typeof window === 'undefined') {
        return fallback;
    }

    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

    if (!value) {
        return fallback;
    }

    return value.includes('oklch') ? oklchToRgbMath(value) : value;
};
interface CustomizationScreenProps {
    errors: Record<string, string>;
    wasSuccessful: boolean;
}
export default function CustomizationScreen({ errors, wasSuccessful }: CustomizationScreenProps) {
    const defaultPrimaryColor = readCssColorVariable(
        '--primary',
        DEFAULT_PRIMARY_COLOR,
    );
    const defaultSecondaryColor = readCssColorVariable(
        '--secondary',
        DEFAULT_SECONDARY_COLOR,
    );
    const [primaryColor, setPrimaryColor] = useState(defaultPrimaryColor);
    const [secondaryColor, setSecondaryColor] = useState(defaultSecondaryColor);

    return (
        <>
            <CardHeader className="flex items-center justify-start gap-2">
                <SwatchBook className="size-5" />
                <div>
                    <h3 className="text-xl font-semibold tracking-tight">
                        تخصيص الواجهة
                    </h3>
                    {wasSuccessful && (
                        <p className="text-sm text-muted-foreground">
                            تم حفظ الإعدادات بنجاح.
                        </p>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-6">
                <CustomColor
                    primaryColor={primaryColor}
                    setPrimaryColor={setPrimaryColor}
                    secondaryColor={secondaryColor}
                    setSecondaryColor={
                        setSecondaryColor
                    }
                    defaultPrimaryColor={
                        defaultPrimaryColor
                    }
                    defaultSecondaryColor={
                        defaultSecondaryColor
                    }
                    errors={errors}
                />
                <MenuStyle errors={errors} />
                <ThemeControls errors={errors} />
            </CardContent>
        </>
    );
}
