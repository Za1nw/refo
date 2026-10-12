"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { format } from "date-fns"
import { arSA, enUS } from "date-fns/locale"
import {
    arSA as arSADayPicker,
    enUS as enDayPicker,
} from "react-day-picker/locale"
import { useDirection } from "./direction"
import { ChevronDownIcon } from "lucide-react"
import { useI18n } from "@/i18n"
import { cn } from "@/lib/utils"

const dayPickerLocales = {
    ar: arSADayPicker,
    en: enDayPicker,
} as const

const dateFnsLocales = {
    ar: arSA,
    en: enUS,
} as const

export function DatePicker(
    {
        date,
        setDate,
        placeholder,
        label,
        className,
    }: {
        date: Date | undefined,
        setDate: (date: Date | undefined) => void,
        placeholder?: string,
        label?: string,
        className?: string,
    }
) {
    const [open, setOpen] = React.useState(false)
    const dirction = useDirection();
    const lang = useI18n().language;

    const dateFnsLocale =
        dirction === "rtl"
            ? dateFnsLocales[lang as keyof typeof dateFnsLocales]
            : undefined
    const dayPickerLocale =
        dirction === "rtl"
            ? dayPickerLocales[lang as keyof typeof dayPickerLocales]
            : undefined

    return (
        <Field className="mx-auto">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        data-empty={!date}
                        className={cn("w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground", className)}
                        dir={dirction}
                    >
                        {date ? (
                            format(date, "PPP", { locale: dateFnsLocale })
                        ) : (
                            <span>{placeholder}</span>
                        )}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        defaultMonth={date}
                        captionLayout="dropdown"
                        dir={dirction}
                        locale={dayPickerLocale}
                        onSelect={(date) => {
                            setDate(date)
                            setOpen(false)
                        }}
                    />
                </PopoverContent>
            </Popover>
        </Field>
    )
}
