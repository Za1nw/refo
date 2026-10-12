interface Pagination<T>{
    data: T[];
    links: Links;
    meta: Meta;
}

interface Links{
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

interface Meta{
    current_page: number;
    from: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}
