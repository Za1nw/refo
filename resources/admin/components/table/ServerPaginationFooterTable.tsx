import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface ServerPaginationFooterProps {
    pagination: {
        links: Links;
        meta: Meta;
    };
    onPageChange: (url: string | null) => void;
    onPageSizeChange?: (size: number, path: string) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

/** يضمن أن الروابط الأربعة الأساسية موجودة دائمًا (null بدل undefined) */
function normalizeLinks(links: Partial<Links> | undefined): Links {
    return {
        first: links?.first ?? null,
        last: links?.last ?? null,
        prev: links?.prev ?? null,
        next: links?.next ?? null,
    };
}

/**
 * يضمن أن كل حقول meta موجودة بقيم رقمية/نصية صحيحة، حتى لو أرسل
 * السيرفر استجابة ناقصة. لا نقرأ window.location هنا أثناء التصيير
 * (render)، لأن هذا المكوّن قد يُصيَّر على السيرفر (SSR)؛ بدل ذلك
 * نترك `path` فارغًا إن لم يصلنا من meta، فلا حاجة لقراءة window إطلاقًا
 * في هذا المسار.
 */
function normalizeMeta(meta: Partial<Meta> | undefined): Meta {
    return {
        total: typeof meta?.total === 'number' ? meta.total : 0,
        per_page: typeof meta?.per_page === 'number' ? meta.per_page : 10,
        current_page:
            typeof meta?.current_page === 'number' ? meta.current_page : 1,
        last_page: typeof meta?.last_page === 'number' ? meta.last_page : 1,
        path: typeof meta?.path === 'string' ? meta.path : '',
    } as Meta;
}

/**
 * يحوّل رابطًا مطلقًا (absolute URL) إلى رابط نسبي (path + search + hash)
 * فقط، لأن استدعاءات Inertia (router.get) تفضّل الروابط النسبية.
 * تُستخدم فقط داخل معالجات الأحداث (onClick)، أي أنها تُنفَّذ في المتصفح
 * دائمًا، فالوصول إلى window هنا آمن.
 */
function normalizeUrl(url: string | null): string | null {
    if (!url || typeof window === 'undefined') {
        return url;
    }

    try {
        const parsed = new URL(url, window.location.origin);
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return url;
    }
}

export default function ServerPaginationFooterTable({
    pagination,
    onPageChange,
    onPageSizeChange,
}: ServerPaginationFooterProps) {
    if (!pagination) {
        return null;
    }

    const safeLinks = normalizeLinks(pagination.links);
    const safeMeta = normalizeMeta(pagination.meta);
    const { t: tMain } = useTranslation('main');

    const from =
        safeMeta.total === 0
            ? 0
            : safeMeta.per_page * (safeMeta.current_page - 1) + 1;
    const to =
        safeMeta.total === 0
            ? 0
            : Math.min(
                  safeMeta.per_page * safeMeta.current_page,
                  safeMeta.total,
              );

    const handleFirst = () => onPageChange(normalizeUrl(safeLinks.first));
    const handleLast = () => onPageChange(normalizeUrl(safeLinks.last));
    const handlePrevious = () => onPageChange(normalizeUrl(safeLinks.prev));
    const handleNext = () => onPageChange(normalizeUrl(safeLinks.next));

    return (
        <div className="flex items-center justify-between px-4">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                {from} - {to} {tMain('of')} {safeMeta.total} {tMain('rows')}
            </div>

            <div className="flex w-full items-center gap-8 max-[430px]:flex-col lg:w-fit">
                {onPageSizeChange && (
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label
                            htmlFor="rows-per-page"
                            className="text-sm font-medium"
                        >
                            {tMain('rows_per_page')}
                        </Label>
                        <Select
                            value={`${safeMeta.per_page}`}
                            onValueChange={(value) =>
                                onPageSizeChange(Number(value), safeMeta.path)
                            }
                        >
                            <SelectTrigger className="w-20" id="rows-per-page">
                                <SelectValue
                                    placeholder={safeMeta.per_page.toString()}
                                >
                                    {safeMeta.per_page.toString()}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent side="top">
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    {tMain('page')} {safeMeta.current_page} {tMain('of')}{' '}
                    {safeMeta.last_page}
                </div>

                <div className="ml-auto flex items-center gap-2 lg:ml-0 rtl:flex-row-reverse">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleFirst}
                        disabled={
                            safeMeta.current_page === 1 || !safeLinks.first
                        }
                    >
                        <span className="sr-only">
                            {tMain('go_to_first_page')}
                        </span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevious}
                        disabled={!safeLinks.prev}
                    >
                        <span className="sr-only">
                            {tMain('go_to_previous_page')}
                        </span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNext}
                        disabled={!safeLinks.next}
                    >
                        <span className="sr-only">
                            {tMain('go_to_next_page')}
                        </span>
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleLast}
                        disabled={
                            safeMeta.current_page === safeMeta.last_page ||
                            !safeLinks.last
                        }
                    >
                        <span className="sr-only">
                            {tMain('go_to_last_page')}
                        </span>
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
