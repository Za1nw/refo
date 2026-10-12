import { Auth } from './auth';

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;

    [key: string]: unknown;
}



// نوع Customer
export interface Customer {
    name: string;
    email: string;
    avatar: string;
}


interface ComboboxSelectProps {
    data: ComboboxItem[];
    commandEmptyText: string;
    placeholder?: string;
    className?: string;
    onSelect: (value: any) => void;
    value: string;
}


interface ComboboxItem {
    value: string;
    label: string;
}

export type { ComboboxItem, ComboboxSelectProps };
