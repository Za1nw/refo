import { TableCell } from "@/components/ui/table";
import { formatterNumber } from "@/lib/cell";

export const currencyCell = (currency = "YER") => ({ getValue }: any) => {
    const raw = getValue?.() as number | string | null | undefined;
    if (raw === null || raw === undefined || raw === "") {
        return <TableCell className="text-center">-</TableCell>;
    }
    return <TableCell dir="ltr" className="text-center">{formatterNumber(raw, currency)}</TableCell>;
};
