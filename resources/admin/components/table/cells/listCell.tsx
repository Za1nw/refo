import { TableCell } from "@/components/ui/table";

export const listCell = (separator = ", ") => ({ getValue }: any) => {
    const v = getValue?.();
    const arr = Array.isArray(v) ? v : [];
    return <TableCell className="text-center">{arr.join(separator)}</TableCell>;
};
