import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SortableSectionCardProps {
    id: string;
    title: string;
    description?: string;
    wide: boolean;
    isOver: boolean;
    isDropped: boolean;
    dragAriaLabel: string;
    isLocked: boolean;
    children: ReactNode;
    isShowTitle?: boolean;
    isShowDescription?: boolean;
}

export default function SortableSectionCard({
    id,
    title,
    description,
    wide,
    isOver,
    isDropped,
    dragAriaLabel,
    isLocked,
    children,
    isShowTitle = true,
    isShowDescription = true,
}: SortableSectionCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        disabled: isLocked,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={(wide ? 'xl:col-span-2 ' : 'xl:col-span-1 ') + (isDragging ? 'z-10 opacity-80 ring-2 ring-ring ' : '')}
        >
            <Card
                className={
                    'transition-shadow duration-200 hover:shadow-sm ' +
                    (isOver ? 'ring-2 ring-ring shadow-sm ' : '') +
                    (isDropped ? 'ring-2 ring-ring shadow-sm ' : '')
                }
            >
                <CardHeader className="flex flex-row items-start justify-between gap-4 border-b/50 pb-4">
                    <div className="min-w-0">
                        {isShowTitle ? (
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base">{title}</CardTitle>
                            </div>
                        ) : null}
                        {description && isShowDescription ? (
                            <p className="mt-1 text-xs text-muted-foreground md:text-sm">{description}</p>
                        ) : null}
                    </div>
                    <div className="shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={
                                'h-8 w-8 rounded-md border border-transparent text-muted-foreground ' +
                                (isLocked ? 'cursor-not-allowed opacity-50 hidden' : 'hover:border-border')
                            }
                            disabled={isLocked}
                            {...attributes}
                            {...listeners}
                        >
                            <GripVerticalIcon className="h-4 w-4" />
                            <span className="sr-only">{dragAriaLabel}</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4">{children}</CardContent>
            </Card>
        </div>
    );
}
