import { TableCell } from "@/components/ui/table";

export const descriptionCell = ({ getValue }: any) => {
    const v = getValue?.();
    return <TableCell>
        <span className="max-w-xs line-clamp-2 break-words whitespace-normal">{v ?? ""}</span>
    </TableCell>;
};
