import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { TableCell } from '@/components/ui/table';
import type { CellContext } from '@tanstack/react-table';
import type { LegacyFeatures } from '@tanstack/react-table/legacy';

export function blogSwitchCell<T extends { is_active: boolean }>(
    onToggle: (item: T, nextValue: boolean) => Promise<boolean>,
) {
    return function BlogActiveCell({ row }: CellContext<LegacyFeatures, T, unknown>) {
        const item = row.original;
        const [isActive, setIsActive] = useState<boolean>(Boolean(item.is_active));
        const [loading, setLoading] = useState(false);

        const handleChange = async (checked: boolean) => {
            setLoading(true);
            setIsActive(checked);

            try {
                const success = await onToggle(item, checked);
                if (!success) {
                    setIsActive(!checked);
                }
            } catch {
                setIsActive(!checked);
            } finally {
                setLoading(false);
            }
        };

        return (
            <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <Switch
                        checked={isActive}
                        disabled={loading}
                        onCheckedChange={handleChange}
                    />
                </div>
            </TableCell>
        );
    };
}
