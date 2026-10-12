import * as React from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ComboboxSelectProps } from "@/types";

/**
 * مكوّن Select مبسّط (بدون بحث) يُستخدم كقائمة اختيار من مجموعة خيارات.
 *
 * تحسينات منطقية تمت هنا:
 * 1) التحقق من أن `data` مصفوفة فعلًا قبل استخدامها (كما كان سابقًا).
 * 2) إزالة أي عناصر بقيمة (value) مكررة أو فارغة قبل العرض، لأن React
 *    سيعطي تحذير "duplicate key" ويُسبب سلوكًا غير متوقع في الاختيار
 *    إذا تكررت نفس القيمة في القائمة.
 */
export function ComboboxSelect({
    data,
    commandEmptyText,
    className,
    onSelect,
    value,
}: ComboboxSelectProps) {
    // نتأكد أن البيانات مصفوفة، ثم نزيل القيم الفارغة/المكررة بمفتاح Set
    const resolvedData = React.useMemo(() => {
        const rawData = Array.isArray(data) ? data : [];
        const seenValues = new Set<string>();

        return rawData.filter((item) => {
            if (!item?.value || seenValues.has(item.value)) {
                return false;
            }
            seenValues.add(item.value);
            return true;
        });
    }, [data]);

    return (
        <div className={className}>
            <Select value={value ? String(value) : undefined} onValueChange={onSelect}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={commandEmptyText ?? ""} />
                </SelectTrigger>
                <SelectContent>
                    {resolvedData.length === 0
                        ? null
                        : resolvedData.map((element) => (
                            <SelectItem key={element.value} value={element.value}>
                                {element.label}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
        </div>
    );
}
