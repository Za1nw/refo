import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";

export const badgeCell = ({ getValue }: any) => {
    const { label, color } = getValue() || { label: "-", color: "gray" };
    return (
        <TableCell className="text-center">
            <Badge
                style={{
                    backgroundColor: color,
                    color: "white",
                }}
            >
                {label}
            </Badge>
        </TableCell>
    );
};
