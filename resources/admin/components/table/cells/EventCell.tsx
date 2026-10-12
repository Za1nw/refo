import { TableCell } from "@/components/ui/table";

export const eventCell = ({ row }: any) => {
    const event = row.original;
    return (
        <TableCell>
            <h2 className="font-medium">{event.title ?? ""}</h2>
            <p className="max-w-xs text-muted-foreground line-clamp-2 break-words whitespace-normal">
                {event.description ?? ""}
            </p>
        </TableCell>
    );
};
