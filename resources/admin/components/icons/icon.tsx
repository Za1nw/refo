import { type LucideProps } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { type ComponentType } from 'react';

import { cn } from '@/lib/utils';

interface IconProps extends Omit<LucideProps, 'ref' | 'name'> {
    iconNode: ComponentType<LucideProps> | string;
}

export function Icon({ iconNode: IconComponent, className, ...props }: IconProps) {
    if (typeof IconComponent === 'string') {
        return (
            <DynamicIcon
                name={IconComponent as IconName}
                className={cn('h-4 w-4', className)}
                {...props}
            />
        );
    }

    return <IconComponent className={cn('h-4 w-4', className)} {...props} />;
}
