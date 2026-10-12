import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDirection } from '@/components/ui/direction';
import { Head } from '@inertiajs/react';
import {
    DndContext,
    DragOverlay,
    pointerWithin,
    rectIntersection,
    useDroppable,
    type CollisionDetection,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GripVerticalIcon, LoaderCircleIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { useBlogFormContext } from '../../context/BlogFormContext';
import { BlogFormProvider } from '../../providers/BlogFormProvider';

import CategorySection from './forms/CategorySection';
import ContentSection from './forms/ContentSection';
import GeneralSection from './forms/GeneralSection';
import FeaturedSection from './forms/FeaturedSection';
import ImageSection from './forms/ImageSection';
import StatusSection from './forms/StatusSection';
import SortableSectionCard from './SortableSectionCard';
import TagsSection from './forms/TagsSection';

const sectionDescriptions: Record<string, { descriptionKey: string }> = {
    general: { descriptionKey: 'Basic blog details.' },
    content: { descriptionKey: 'Description and content.' },
    image: { descriptionKey: 'Cover image.' },
    category: { descriptionKey: 'Classification.' },
    tags: { descriptionKey: 'Related tags.' },
    status: { descriptionKey: 'Visibility.' },
    featured: { descriptionKey: 'Featured blog toggle.' },
};

const sectionCollisionDetection: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) {
        return pointerHits;
    }

    return rectIntersection(args);
};

function BlogFormPageContent() {
    const {
        t,
        tMain,
        processing,
        secondarySections,
        primarySections,
        sensors,
        overSectionId,
        activeSectionId,
        lastDroppedSectionId,
        submit,
        handleSectionDragCancel,
        handleSectionDragOver,
        handleSectionDragEnd,
        handleSectionDragStart,
        isSectionLocked,
        mode,
    } = useBlogFormContext();

    const direction = useDirection();

    const renderSectionCard = (section: { id: string; title: string }, content: ReactNode) => {
        const descriptionKey = sectionDescriptions[section.id]?.descriptionKey;
        const description = descriptionKey ? t(descriptionKey) : undefined;

        return (
            <SortableSectionCard
                key={section.id}
                id={section.id}
                title={section.title}
                description={description}
                wide={false}
                isOver={section.id === overSectionId && Boolean(activeSectionId)}
                isDropped={section.id === lastDroppedSectionId}
                dragAriaLabel={tMain('Drag to reorder')}
                isLocked={isSectionLocked(section.id)}
            >
                {content}
            </SortableSectionCard>
        );
    };

    const renderSectionContent = (section: { id: string }) => {
        if (section.id === 'general') {
            return <GeneralSection />;
        }

        if (section.id === 'content') {
            return <ContentSection />;
        }

        if (section.id === 'image') {
            return <ImageSection />;
        }

        if (section.id === 'category') {
            return <CategorySection />;
        }

        if (section.id === 'tags') {
            return <TagsSection />;
        }

        if (section.id === 'status') {
            return <StatusSection />;
        }

        if (section.id === 'featured') {
            return <FeaturedSection />;
        }

        return null;
    };

    const activeTitle = [...primarySections, ...secondarySections].find((section) => section.id === activeSectionId)?.title ?? '';

    return (
        <div className="flex flex-col gap-4" dir={direction}>
            <Head title={mode === 'create' ? t('Create') : t('Edit')} />

            <div className="sticky top-0 z-20 rounded-xl border bg-background/90 p-3 shadow-sm backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold leading-none md:text-lg">
                            {mode === 'create' ? t('Create Blog') : t('Edit Blog')}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                            {tMain('Drag sections to arrange the form in the layout that fits your workflow.')}
                        </p>
                    </div>
                    <Button type="button" onClick={submit} disabled={processing} className="min-w-36">
                        {processing ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : null}
                        {mode === 'create' ? t('Create') : t('Save')}
                    </Button>
                </div>
            </div>

            <div className="@container/main">
                <DndContext
                    collisionDetection={sectionCollisionDetection}
                    onDragCancel={handleSectionDragCancel}
                    onDragOver={handleSectionDragOver}
                    onDragEnd={handleSectionDragEnd}
                    onDragStart={handleSectionDragStart}
                    sensors={sensors as any}
                >
                    <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-2 @5xl:grid-cols-[2fr_1fr]">
                        <SectionColumn id="primary" isEmpty={primarySections.length === 0} emptyLabel={tMain('Drop section here')}>
                            <SortableContext items={primarySections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                                <div className="flex flex-col gap-4">
                                    {primarySections.map((section) => renderSectionCard(section, renderSectionContent(section)))}
                                </div>
                            </SortableContext>
                        </SectionColumn>

                        <SectionColumn id="secondary" isEmpty={secondarySections.length === 0} emptyLabel={tMain('Drop section here')}>
                            <SortableContext items={secondarySections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                                <div className="flex flex-col gap-4">
                                    {secondarySections.map((section) => renderSectionCard(section, renderSectionContent(section)))}
                                </div>
                            </SortableContext>
                        </SectionColumn>
                    </div>

                    <DragOverlay>
                        {activeSectionId ? (
                            <div className="grid grid-cols-1">
                                <Card className="border-dashed opacity-95 shadow-lg">
                                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
                                            <CardTitle>{activeTitle}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">{tMain('Drop to place')}</CardContent>
                                </Card>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}

function SectionColumn({
    id,
    isEmpty,
    emptyLabel,
    children,
}: {
    id: 'primary' | 'secondary';
    isEmpty: boolean;
    emptyLabel: string;
    children: ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={
                'flex min-h-56 flex-col gap-4 rounded-lg p-2 transition-colors md:min-h-96 ' +
                (isOver ? 'bg-primary/5 ring-2 ring-primary/30' : '')
            }
        >
            {isEmpty ? (
                <div className="flex min-h-44 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground md:min-h-80">
                    {emptyLabel}
                </div>
            ) : null}
            {children}
        </div>
    );
}

export default function BlogFormPage({ mode }: { mode: 'create' | 'edit' }) {
    return (
        <BlogFormProvider mode={mode}>
            <BlogFormPageContent />
        </BlogFormProvider>
    );
}
