import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";

export const booleanBadgeCell = (trueLabel = "نعم", falseLabel = "لا") => ({ getValue }: any) => {
    const value = getValue();
    return (
        <TableCell className="text-center">
            <Badge className={value ? "bg-green-600/25 text-green-500" : "bg-red-600/25 text-red-500"}>
                {value ? trueLabel : falseLabel}
            </Badge>
        </TableCell>
    );
};
