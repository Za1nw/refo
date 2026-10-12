import { TableCell } from "@/components/ui/table";

export const textCell = ({ getValue }: any) => {
    const v = getValue?.();
    return <TableCell className="">{v ?? ""}</TableCell>;
};
