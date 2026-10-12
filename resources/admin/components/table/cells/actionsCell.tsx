import i18n from 'i18next';
import type { LucideIcon } from 'lucide-react';
import {
    DownloadIcon,
    EditIcon,
    EyeIcon,
    GlobeIcon,
    KeyRoundIcon,
    LayoutTemplateIcon,
    RotateCcwIcon,
    Trash2Icon,
    WalletIcon,
} from 'lucide-react';

import { TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type ActionHandlerFn = (item: any) => void;

type ActionOptions = {
    Icon?: LucideIcon;
    label?: string;
    color?: string;
    size?: number;
    className?: string;
};

type ActionHandlerConfig =
    | ActionHandlerFn
    | ({
          onClick: ActionHandlerFn;
          isVisible?: (item: any) => boolean;
      } & ActionOptions);

type ActionHandlers = {
    onEdit?: ActionHandlerConfig;
    onDelete?: ActionHandlerConfig;
    onForceDelete?: ActionHandlerConfig;
    onTranslate?: ActionHandlerConfig;
    onLayout?: ActionHandlerConfig;
    onView?: ActionHandlerConfig;
    onDownload?: ActionHandlerConfig;
    onRestore?: ActionHandlerConfig;
    onPassword?: ActionHandlerConfig;
    onWalletTopUp?: ActionHandlerConfig;
    onReceipt?: ActionHandlerConfig;
    [key: string]: ActionHandlerConfig | undefined;
};

const actionMap = {
    onEdit: { Icon: EditIcon, color: 'text-blue-600', labelKey: 'Edit' },
    onDelete: { Icon: Trash2Icon, color: 'text-red-600', labelKey: 'Move to trash' },
    onForceDelete: { Icon: Trash2Icon, color: 'text-red-600', labelKey: 'Delete permanently' },
    onTranslate: { Icon: GlobeIcon, color: 'text-green-600', labelKey: 'Translate' },
    onLayout: { Icon: LayoutTemplateIcon, color: 'text-indigo-600', labelKey: 'Design Layout' },
    onView: { Icon: EyeIcon, color: 'text-gray-600', labelKey: 'View' },
    onDownload: { Icon: DownloadIcon, color: 'text-primary', labelKey: 'Download' },
    onRestore: { Icon: RotateCcwIcon, color: 'text-primary', labelKey: 'Restore' },
    onPassword: { Icon: KeyRoundIcon, color: 'text-primary', labelKey: 'Change Password' },
    onWalletTopUp: { Icon: WalletIcon, color: 'text-primary', labelKey: 'Top up wallet' },
    onReceipt: { Icon: DownloadIcon, color: 'text-primary', labelKey: 'View Receipt' },
};

function resolveHandler(config: ActionHandlerConfig) {
    if (typeof config === 'function') {
        return {
            onClick: config,
            isVisible: () => true,
            options: {},
        };
    }

    const { onClick, isVisible, Icon, label, color, size, className } = config;

    return {
        onClick,
        isVisible: isVisible ?? (() => true),
        options: {
            Icon,
            label,
            color,
            size,
            className,
        },
    };
}

export const actionsCell =
    (handlers: ActionHandlers = {}) =>
    ({ row }: any) => {
        const item = row.original;
        const t = (key: string) => i18n.t(key, { ns: 'main' });
        return (
            <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-4">
                    {Object.entries(handlers).map(([key, fn]) => {
                        if (!fn) return null;
                        const resolved = resolveHandler(fn as ActionHandlerConfig);
                        if (!resolved.isVisible(item)) return null;

                        const defaults = actionMap[key as keyof typeof actionMap];

                        const Icon = resolved.options.Icon ?? defaults?.Icon ?? (() => null);
                        const color = resolved.options.color ?? defaults?.color ?? '';
                        const label =
                            resolved.options.label ?? t(defaults?.labelKey) ?? '';
                        const size = resolved.options.size ?? 16;
                        const className = resolved.options.className ?? '';

                        return (
                            <Tooltip key={key}>
                                <TooltipTrigger asChild className="cursor-pointer!">
                                    <Icon
                                        size={size}
                                        className={`cursor-pointer! ${color} ${className}`}
                                        onClick={() => resolved.onClick(item)}
                                    />
                                </TooltipTrigger>

                                <TooltipContent>
                                    <p>{label}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </TableCell>
        );
    };
