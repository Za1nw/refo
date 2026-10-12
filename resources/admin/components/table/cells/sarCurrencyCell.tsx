import IconRial from "@/components/icons/icon-rial";
import { TableCell } from "@/components/ui/table";
import { formatterNumber } from "@/lib/cell";

// بدل ما ترجع دالة داخل دالة
export const sarCurrencyCell = ({ getValue }: any) => {
    const raw = getValue?.() as number | string | null | undefined;

    if (raw === null || raw === undefined || raw === "") {
        return <TableCell className="text-center">-</TableCell>;
    }
    const num = typeof raw === "string" ? Number(raw) : raw;
    if (!Number.isFinite(num)) {
        return <TableCell className="text-center">{String(raw)}</TableCell>;
    }
    const valueOnly = formatterNumber(num);
    return (
        <TableCell className="text-center">
            <div className="flex items-center justify-center flex-row-reverse">
                <IconRial className="size-4 *:fill-primary" />
                {valueOnly}
            </div>
        </TableCell>
    );
};
