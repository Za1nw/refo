import type { ReactNode } from 'react';

import { BlogFormContext } from '../context/BlogFormContext';
import { useBlogFormState } from '../hooks/blog/useBlogForm';

export function BlogFormProvider({ mode, children }: { mode: 'create' | 'edit'; children: ReactNode }) {
    const state = useBlogFormState(mode);

    return (
        <BlogFormContext.Provider
            value={{
                mode,
                blog: state.blog,
                form: state.form,
                t: state.t,
                tMain: state.tMain,
                processing: state.processing,
                sensors: state.sensors,
                activeSectionId: state.activeSectionId,
                overSectionId: state.overSectionId,
                lastDroppedSectionId: state.lastDroppedSectionId,
                primarySections: state.primarySections,
                secondarySections: state.secondarySections,
                submit: state.submit,
                handleSectionDragCancel: state.handleSectionDragCancel,
                handleSectionDragOver: state.handleSectionDragOver,
                handleSectionDragEnd: state.handleSectionDragEnd,
                handleSectionDragStart: state.handleSectionDragStart,
                isSectionLocked: state.isSectionLocked,
            }}
        >
            {children}
        </BlogFormContext.Provider>
    );
}
