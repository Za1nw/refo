import { TableCell } from "@/components/ui/table";

export default function BlogCell(info: any) {
    const fullRow = info.row.original;
    const value = info.getValue();

    return (
        <TableCell className="flex items-center gap-4">
            {fullRow.image?.thumb_hd && (
                <img
                    src={fullRow.image.thumb_hd}
                    className="w-12 h-12 rounded object-cover"
                />
            )}

            <div className="flex flex-col">
                <span className="font-medium">{value}</span>
                <span className="text-sm text-muted-foreground">
                    {fullRow.category?.name}
                </span>
            </div>
        </TableCell>
    );
}
