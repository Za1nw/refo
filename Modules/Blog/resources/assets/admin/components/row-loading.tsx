import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { JSX } from "react";

export default function RowLoading(columns: any, columnCount: number, pageSize: number): JSX.Element[] {
    console.log(columns.length, columnCount);

    return (
        Array.from({ length: pageSize }).map((_, index) => (
            <TableRow key={index} className="">
                <TableCell
                    className={cn(
                        "text-center",
                        columns.length === columnCount ? "hidden" : ""
                    )}
                >
                    <Skeleton className="size-6 rounded-full" />
                </TableCell>
                <TableCell
                    className={cn(
                        "text-center",
                        columns.indexOf(0) === -1 ? "hidden" : ""
                    )}
                >
                    <Skeleton className="h-4 w-full" />
                </TableCell>

                <TableCell
                    className={cn(
                        "text-center",
                        columns.indexOf(1) === -1 ? "hidden" : ""
                    )}
                >
                    <Skeleton className="h-4 w-full" />
                </TableCell>

                <TableCell className={cn(
                    "text-center flex flex-col gap-1",
                    columns.indexOf(2) === -1 ? "hidden" : ""
                )}>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </TableCell>

                <TableCell className={cn(
                    "text-center",
                    columns.indexOf(3) === -1 ? "hidden" : ""
                )}>
                    <Skeleton className="h-4 w-full" />
                </TableCell>

                <TableCell className={cn(
                    "text-center",
                    columns.indexOf(4) === -1 ? "hidden" : ""
                )}>
                    <div className="flex gap-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </TableCell>

                <TableCell className={cn(
                    "text-center",
                    columns.indexOf(5) === -1 ? "hidden" : ""
                )}>
                    <div className="flex gap-1 justify-center">
                        <Skeleton className="size-6 rounded-full" />
                        <Skeleton className="size-6 rounded-full" />
                        <Skeleton className="size-6 rounded-full" />
                    </div>
                </TableCell>
            </TableRow>
        ))
    );
}
