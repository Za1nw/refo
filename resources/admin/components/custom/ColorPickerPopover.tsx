

import { Button } from "@/components/ui/button"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ColorPicker, ColorPickerAlpha, ColorPickerEyeDropper, ColorPickerFormat, ColorPickerHue, ColorPickerOutput, ColorPickerSelection } from "./color-picker"

export function ColorPickerPopover({
    defaultValue = '#6366f1',
    value,
    onChange,
}: {
    defaultValue?: string;
    value?: string;
    onChange?: (value: any, hex: string) => void;
}) {

    return (
        <Popover >
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-10"
                    style={{
                        background: value || defaultValue
                    }}
                >
                </Button>
            </PopoverTrigger>
            <PopoverContent dir="ltr" className="w-[90vw] max-w-64 p-3 @sm:p-4" align="start">
                <ColorPicker
                    defaultValue={defaultValue}
                    onChange={onChange as any}
                    className="h-auto w-full"
                    dir="ltr"
                >
                    <ColorPickerSelection dir="ltr" className="h-32 @sm:h-40 rounded-lg" />
                    <ColorPickerHue className="mt-2" dir="ltr" />
                    <ColorPickerAlpha className="mt-2" dir="ltr" />
                    <ColorPickerFormat dir="ltr" />
                    <div className="flex items-center justify-between gap-2">
                        <ColorPickerEyeDropper />
                        <ColorPickerOutput dir="ltr" className="flex-1 text-sm" />
                    </div>
                </ColorPicker>
            </PopoverContent>
        </Popover>
    )
}
