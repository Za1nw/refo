import { TableCell } from '@/components/ui/table';

export const centeredTextCell = ({ getValue }: { getValue?: () => unknown }) => {
    const value = getValue?.();
    const text = value === null || value === undefined ? '' : String(value);

    return <TableCell className="text-center">{text}</TableCell>;
};
