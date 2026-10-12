import { Link, router } from '@inertiajs/react';
import {
    columnVisibilityFeature,
    createColumnHelper,
    tableFeatures,
    useTable,
} from '@tanstack/react-table';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search,
    FileText, Filter, X, ArrowUpDown, ArrowUp, ArrowDown,
    Edit, Languages, Eye, RefreshCw, ListFilter
} from 'lucide-react';
import { useMemo, useState, useEffect, type FormEvent, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

import type { TranslationFileRow } from '../types';

type TranslationFilesTableProps = {
    files: TranslationFileRow[];
    filters: {
        search: string;
        namespace: string;
        locale: string;
        per_page: number;
        page: number;
        sort_by: string;
        sort_order: string;
    };
    locales: string[];
    indexUrl: string;
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
};

const features = tableFeatures({
    columnVisibilityFeature,
});

const columnHelper = createColumnHelper<typeof features, TranslationFileRow>();

export default function TranslationFilesTable({ files, filters, locales, indexUrl, pagination }: TranslationFilesTableProps) {
    const [search, setSearch] = useState(filters.search);
    const [namespace, setNamespace] = useState(filters.namespace);
    const [locale, setLocale] = useState(filters.locale);
    const [perPage, setPerPage] = useState(String(filters.per_page));
    const [sortBy, setSortBy] = useState(filters.sort_by);
    const [sortOrder, setSortOrder] = useState(filters.sort_order);
    const [isFiltersVisible, setIsFiltersVisible] = useState(true);
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Check if any filter is active
    const hasActiveFilters = search || namespace || locale;

    // Clear all filters
    const clearAllFilters = () => {
        setSearch('');
        setNamespace('');
        setLocale('');
        setDebouncedSearch('');

        router.get(indexUrl, {
            search: '',
            namespace: '',
            locale: '',
            per_page: perPage,
            page: 1,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const columns = useMemo(() => columnHelper.columns([
        columnHelper.accessor('label', {
            header: 'اسم الصفحة',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.original.label}</span>
                </div>
            ),
        }),
        columnHelper.accessor('group', {
            header: 'المجموعة',
            cell: ({ row }) => (
                <Badge variant="secondary" className="font-mono text-xs">
                    {row.original.group}
                </Badge>
            ),
        }),
        columnHelper.accessor('namespace', {
            header: 'النطاق',
            cell: ({ row }) => (
                <Badge variant="outline" className="rounded-full px-3 py-1">
                    {row.original.namespace}
                </Badge>
            ),
        }),
        columnHelper.accessor('text_count', {
            header: 'عدد النصوص',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{row.original.text_count}</span>
                    <span className="text-xs text-muted-foreground">نص</span>
                </div>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'الإجراءات',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="ghost" size="sm" className="gap-1.5">
                                    <Link href={`${row.original.edit_url}?locale=${encodeURIComponent(locale)}`}>
                                        <Edit className="h-3.5 w-3.5" />
                                        تعديل
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>تعديل ترجمات {row.original.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        }),
    ]), [locale]);

    const table = useTable({
        features,
        data: files,
        columns,
    });

    const currentQuery = useCallback(() => ({
        search: debouncedSearch,
        namespace,
        locale,
        per_page: perPage,
        page: 1,
        sort_by: sortBy,
        sort_order: sortOrder,
    }), [debouncedSearch, namespace, locale, perPage, sortBy, sortOrder]);

    const submitFilters = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(indexUrl, currentQuery(), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, [indexUrl, currentQuery]);

    const goToPage = useCallback((page: number) => {
        router.get(indexUrl, {
            search: debouncedSearch,
            namespace,
            locale,
            per_page: perPage,
            page,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, [indexUrl, debouncedSearch, namespace, locale, perPage, sortBy, sortOrder]);

    const toggleSort = useCallback((column: 'label' | 'group' | 'namespace' | 'text_count') => {
        const nextOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';

        setSortBy(column);
        setSortOrder(nextOrder);

        router.get(indexUrl, {
            search: debouncedSearch,
            namespace,
            locale,
            per_page: perPage,
            page: 1,
            sort_by: column,
            sort_order: nextOrder,
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, [indexUrl, debouncedSearch, namespace, locale, perPage, sortBy, sortOrder]);

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
        return sortOrder === 'asc' ?
            <ArrowUp className="h-3.5 w-3.5 text-primary" /> :
            <ArrowDown className="h-3.5 w-3.5 text-primary" />;
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const totalPages = pagination.total_pages;
        const currentPage = pagination.current_page;
        const delta = 2;
        const range: (number | string)[] = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            } else if (range[range.length - 1] !== '...') {
                range.push('...');
            }
        }

        return range;
    };

    // Quick stats
    const totalTexts = files.reduce((sum, file) => sum + file.text_count, 0);
    const avgTextsPerFile = files.length > 0 ? Math.round(totalTexts / files.length) : 0;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">ملفات الترجمة</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        إدارة وتعديل ملفات الترجمة الخاصة بالتطبيق
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Refresh Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.reload()}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>تحديث البيانات</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Toggle Filters */}
                    <Button
                        variant={isFiltersVisible ? "secondary" : "outline"}
                        onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        الفلاتر
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1">
                                !
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            {isFiltersVisible && (
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={submitFilters}>
                            <div className="grid gap-4 lg:grid-cols-12">
                                <div className="grid gap-2 lg:col-span-4">
                                    <Label htmlFor="search" className="flex items-center gap-2">
                                        <Search className="h-3.5 w-3.5" />
                                        البحث
                                    </Label>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            className="pr-9"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="اسم الصفحة أو المجموعة..."
                                        />
                                        {search && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute left-1 top-1/2 h-7 w-7 -translate-y-1/2"
                                                onClick={() => setSearch('')}
                                                type="button"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="namespace">النطاق</Label>
                                    <Input
                                        id="namespace"
                                        value={namespace}
                                        onChange={(event) => setNamespace(event.target.value)}
                                        placeholder="مثال: web"
                                    />
                                </div>

                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="locale">اللغة</Label>
                                    <Select value={locale} onValueChange={setLocale}>
                                        <SelectTrigger id="locale">
                                            <SelectValue placeholder="اختر اللغة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locales.map((item) => (
                                                <SelectItem key={item} value={item}>
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="per_page">عدد العناصر</Label>
                                    <Select value={perPage} onValueChange={setPerPage}>
                                        <SelectTrigger id="per_page">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[10, 20, 30, 50, 100].map((item) => (
                                                <SelectItem key={item} value={String(item)}>
                                                    {item} عنصر
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end gap-2 lg:col-span-2">
                                    <Button type="submit" className="flex-1 gap-2">
                                        <Search className="h-4 w-4" />
                                        تطبيق
                                    </Button>
                                    {hasActiveFilters && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={clearAllFilters}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>مسح جميع الفلاتر</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Stats Bar */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pagination.total}</p>
                            <p className="text-xs text-muted-foreground">ملف ترجمة</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                            <Languages className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalTexts}</p>
                            <p className="text-xs text-muted-foreground">إجمالي النصوص</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                            <ListFilter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{avgTextsPerFile}</p>
                            <p className="text-xs text-muted-foreground">متوسط النصوص/ملف</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Card */}
            <Card>
                <CardHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                قائمة الملفات
                            </CardTitle>
                            {hasActiveFilters && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    تم العثور على {pagination.total} ملف
                                </p>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    ترتيب حسب
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>ترتيب حسب</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toggleSort('label')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    اسم الصفحة
                                    {sortBy === 'label' && (
                                        <Badge variant="secondary" className="mr-auto">
                                            {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
                                        </Badge>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleSort('group')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    المجموعة
                                    {sortBy === 'group' && (
                                        <Badge variant="secondary" className="mr-auto">
                                            {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
                                        </Badge>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleSort('text_count')}>
                                    <Languages className="mr-2 h-4 w-4" />
                                    عدد النصوص
                                    {sortBy === 'text_count' && (
                                        <Badge variant="secondary" className="mr-auto">
                                            {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
                                        </Badge>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="border-b bg-muted/30">
                                        {headerGroup.headers.map((header, index) => (
                                            <th
                                                key={header.id}
                                                className={`px-4 py-3 text-start text-sm font-semibold text-muted-foreground ${
                                                    index === 0 ? 'pr-6' : index === headerGroup.headers.length - 1 ? 'pl-6' : ''
                                                }`}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                                                        onClick={() => {
                                                            if (header.column.id === 'actions') return;
                                                            toggleSort(header.column.id as any);
                                                        }}
                                                    >
                                                        <table.FlexRender header={header} />
                                                        {header.column.id !== 'actions' && getSortIcon(header.column.id)}
                                                    </button>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row, rowIndex) => (
                                        <tr
                                            key={row.id}
                                            className={`border-b transition-colors hover:bg-muted/50 ${
                                                rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                                            }`}
                                        >
                                            {row.getVisibleCells().map((cell, cellIndex) => (
                                                <td
                                                    key={cell.id}
                                                    className={`px-4 py-3 ${
                                                        cellIndex === 0 ? 'pr-6' : cellIndex === row.getVisibleCells().length - 1 ? 'pl-6' : ''
                                                    }`}
                                                >
                                                    <table.FlexRender cell={cell} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <FileText className="mb-3 h-12 w-12 text-muted-foreground/30" />
                                                <p className="text-lg font-medium">لا توجد ملفات</p>
                                                <p className="mt-1 text-sm">
                                                    {hasActiveFilters
                                                        ? 'لا توجد ملفات تطابق معايير البحث الحالية'
                                                        : 'لم يتم العثور على أي ملفات ترجمة'}
                                                </p>
                                                {hasActiveFilters && (
                                                    <Button
                                                        variant="outline"
                                                        className="mt-4 gap-2"
                                                        onClick={clearAllFilters}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        مسح الفلاتر
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Pagination */}
            {pagination.total > 0 && (
                <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-muted px-3 py-1.5">
                            <span className="text-sm font-medium">
                                الصفحة {pagination.current_page} من {pagination.total_pages}
                            </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            • {pagination.total} ملف
                        </span>
                        <Separator orientation="vertical" className="hidden h-6 sm:block" />
                        <span className="hidden text-sm text-muted-foreground sm:inline">
                            عرض {Math.min(pagination.per_page, pagination.total)} من {pagination.total}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* First Page */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => goToPage(1)}
                                        disabled={pagination.current_page <= 1}
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>الصفحة الأولى</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Previous Page */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => goToPage(Math.max(1, pagination.current_page - 1))}
                                        disabled={pagination.current_page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>الصفحة السابقة</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Page Numbers */}
                        <div className="hidden sm:flex sm:items-center sm:gap-1">
                            {getPageNumbers().map((page, index) => (
                                typeof page === 'number' ? (
                                    <Button
                                        key={index}
                                        variant={page === pagination.current_page ? 'default' : 'outline'}
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => goToPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ) : (
                                    <span key={index} className="px-2 text-muted-foreground">...</span>
                                )
                            ))}
                        </div>

                        {/* Next Page */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => goToPage(Math.min(pagination.total_pages, pagination.current_page + 1))}
                                        disabled={pagination.current_page >= pagination.total_pages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>الصفحة التالية</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Last Page */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => goToPage(pagination.total_pages)}
                                        disabled={pagination.current_page >= pagination.total_pages}
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>الصفحة الأخيرة</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            )}
        </div>
    );
}
