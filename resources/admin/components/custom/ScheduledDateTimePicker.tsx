'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ScheduledDateTimePickerProps {
    /** نفس صيغة input[type=datetime-local]: "YYYY-MM-DDTHH:mm"، أو '' إن لم يُحدَّد بعد */
    value: string;
    onChange: (value: string) => void;
}

/**
 * نفس الفكرة والتصميم اللي أرسلته بالضبط (Calendar + أعمدة تمرير
 * للساعة/الدقيقة/AM-PM)، لكن بفروقين ضروريين:
 *
 * 1. **controlled**: state الأصلي كان محلياً (useState<Date>() داخل
 *    الكومبوننت نفسه) - حوّلته لـ value/onChange نصي (نفس صيغة
 *    datetime-local) عشان يتوصّل مباشرة بـ scheduledFor من
 *    useOrderForm بدون أي تحويل إضافي في الفورم.
 *
 * 2. **type="button" على كل الأزرار**: الأصل كانت الأزرار بدون هذا
 *    الـ attribute، فبما أنها داخل <form> في FormOrder، أي ضغطة على
 *    ساعة/دقيقة/AM-PM كانت سترسل الفورم فوراً (submit مبكر) بدل مجرد
 *    اختيار الوقت - باگ حقيقي كان سيظهر فور الاستخدام الفعلي.
 *
 * كذلك أضفت `disabled` على تواريخ الماضي (Calendar) لأن الباك-إند
 * يرفض `scheduled_for` إن لم يكن `after:now` - أفضل نمنع الاختيار
 * الخاطئ من الواجهة بدل انتظار خطأ 422.
 */
export function ScheduledDateTimePicker({ value, onChange }: ScheduledDateTimePickerProps) {
    const { t } = useTranslation('orders');
    const [isOpen, setIsOpen] = React.useState(false);

    const date = value ? new Date(value) : undefined;

    const toLocalValue = (d: Date): string => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;
        // نحافظ على الوقت المُختار سابقاً (إن وُجد) عند تغيير اليوم فقط
        const next = date ? new Date(date) : new Date(selectedDate);
        next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        onChange(toLocalValue(next));
    };

    const handleTimeChange = (type: 'hour' | 'minute' | 'ampm', value: string) => {
        const next = date ? new Date(date) : new Date();
        if (type === 'hour') {
            next.setHours((parseInt(value) % 12) + (next.getHours() >= 12 ? 12 : 0));
        } else if (type === 'minute') {
            next.setMinutes(parseInt(value));
        } else if (type === 'ampm') {
            const currentHours = next.getHours();
            if (value === 'PM' && currentHours < 12) next.setHours(currentHours + 12);
            if (value === 'AM' && currentHours >= 12) next.setHours(currentHours - 12);
        }
        onChange(toLocalValue(next));
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1).reverse();
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                >
                    <CalendarIcon className="me-2 h-4 w-4" />
                    {date ? format(date, 'MM/dd/yyyy hh:mm aa') : <span>{t('Pick a date and time')}</span>}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={{ before: today }}
                        
                    />

                    <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex p-2 sm:flex-col">
                                {hours.map((hour) => (
                                    <Button
                                        key={hour}
                                        type="button"
                                        size="icon"
                                        variant={date && date.getHours() % 12 === hour % 12 ? 'default' : 'ghost'}
                                        className="aspect-square shrink-0 sm:w-full"
                                        onClick={() => handleTimeChange('hour', hour.toString())}
                                    >
                                        {hour}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>

                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex p-2 sm:flex-col">
                                {minutes.map((minute) => (
                                    <Button
                                        key={minute}
                                        type="button"
                                        size="icon"
                                        variant={date && date.getMinutes() === minute ? 'default' : 'ghost'}
                                        className="aspect-square shrink-0 sm:w-full"
                                        onClick={() => handleTimeChange('minute', minute.toString())}
                                    >
                                        {minute}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>

                        <ScrollArea>
                            <div className="flex p-2 sm:flex-col">
                                {['AM', 'PM'].map((ampm) => (
                                    <Button
                                        key={ampm}
                                        type="button"
                                        size="icon"
                                        variant={
                                            date &&
                                            ((ampm === 'AM' && date.getHours() < 12) ||
                                                (ampm === 'PM' && date.getHours() >= 12))
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        className="aspect-square shrink-0 sm:w-full"
                                        onClick={() => handleTimeChange('ampm', ampm)}
                                    >
                                        {ampm}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
