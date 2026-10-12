import { TableCell } from "@/components/ui/table";

export const dateCell = (isTime = true) => ({ getValue }: any) => {
    const raw = getValue?.();
    if (!raw) return <TableCell className="text-center">-</TableCell>;
    const date = new Date(raw);
    if (isNaN(date.getTime())) return <TableCell className="text-center">-</TableCell>;
    return (
        <TableCell className="text-center">
            {isTime ? date.toLocaleString() : date.toLocaleDateString()}
        </TableCell>
    );
};
