import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type TranslationPaginationProps = {
    currentPage: number;
    totalPages: number;
    perPage: number;
    totalEntries: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
};

export default function TranslationPagination({
    currentPage,
    totalPages,
    perPage,
    totalEntries,
    onPageChange,
    onPerPageChange,
}: TranslationPaginationProps) {
    const pageNumbers: Array<number | string> = [];
    const delta = 2;

    for (let page = 1; page <= totalPages; page += 1) {
        if (page === 1 || page === totalPages || (page >= currentPage - delta && page <= currentPage + delta)) {
            pageNumbers.push(page);
        } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
            pageNumbers.push('...');
        }
    }

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/90 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
            <div className="flex items-center gap-2">
                <div className="rounded-lg bg-muted px-3 py-1.5">
                    <span className="text-sm font-medium">الصفحة {currentPage} من {totalPages}</span>
                </div>
                <span className="text-sm text-muted-foreground">• {totalEntries} مفتاح</span>
                <Separator orientation="vertical" className="hidden h-6 sm:block" />
                <span className="hidden text-sm text-muted-foreground sm:inline">
                    عرض {Math.min(perPage, totalEntries)} من {totalEntries}
                </span>
            </div>

            <div className="flex items-center gap-1.5">
                <TooltipProvider>
                    {/* First Page */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => onPageChange(1)}
                                disabled={currentPage <= 1}
                            >
                                <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>الصفحة الأولى</TooltipContent>
                    </Tooltip>

                    {/* Previous Page */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage <= 1}
                            >
                                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>الصفحة السابقة</TooltipContent>
                    </Tooltip>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex sm:items-center sm:gap-1">
                        {pageNumbers.map((page, index) => (
                            typeof page === 'number' ? (
                                <Button
                                    key={index}
                                    variant={page === currentPage ? 'default' : 'outline'}
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => onPageChange(page)}
                                >
                                    {page}
                                </Button>
                            ) : (
                                <span key={index} className="px-2 text-muted-foreground">...</span>
                            )
                        ))}
                    </div>

                    {/* Next Page */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage >= totalPages}
                            >
                                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>الصفحة التالية</TooltipContent>
                    </Tooltip>

                    {/* Last Page */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => onPageChange(totalPages)}
                                disabled={currentPage >= totalPages}
                            >
                                <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>الصفحة الأخيرة</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="ms-2 w-28">
                    <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
