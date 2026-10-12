import { useMemo, useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';

import type { TranslationEditorPageProps } from '../types/translation-editor';
import { useTranslationEditor } from '../hooks/useTranslationEditor';
import TranslationToolbar from '../components/TranslationToolbar';
import TranslationStats from '../components/TranslationStats';
import TranslationList from '../components/TranslationList';
import TranslationPagination from '../components/TranslationPagination';
import TranslationRow from '../components/TranslationRow';
import UnsavedChangesDialog from '../components/UnsavedChangesDialog';

export default function TranslationEditorPage(props: TranslationEditorPageProps) {
    const {
        state,
        stats,
        navigation,
        draftValues,
        dirtyKeys,
        hasUnsavedChanges,
        saveTranslations,
        restoreAllSourceValues,
        discardCurrentLocaleDrafts,
        setSearchTerm,
        executeSearch,
        clearSearch,
        setLocale,
        setPage,
        setPerPage,
        setActiveKey,
        setDraftValue,
        resetDraftValue,
        toggleSource,
        expandAll,
        collapseAll,
        toggleExpanded,
        focusNextEntry,
    } = useTranslationEditor(props);

    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

    const handleBack = useCallback(() => {
        if (hasUnsavedChanges) {
            setLeaveDialogOpen(true);
            return;
        }

        router.get(props.index_url);
    }, [hasUnsavedChanges, props.index_url]);

    const handleDiscardAndLeave = useCallback(() => {
        discardCurrentLocaleDrafts();
        setLeaveDialogOpen(false);
        router.get(props.index_url);
    }, [discardCurrentLocaleDrafts, props.index_url]);

    const handleSave = useCallback(() => {
        saveTranslations(props.update_url);
    }, [props.update_url, saveTranslations]);

    return (
        <>
            <div className="space-y-6 p-4 md:p-6">
                <TranslationStats
                    totalEntries={stats.totalEntries}
                    translatedEntries={stats.translatedEntries}
                    emptyEntries={stats.emptyEntries}
                    progressPercentage={stats.progressPercentage}
                    modifiedEntries={stats.modifiedEntries}
                    modifiedPercentage={stats.modifiedPercentage}
                    unsavedEntries={dirtyKeys.length}
                />

                <TranslationToolbar
                    fileLabel={props.file.label}
                    fileGroup={props.file.group}
                    fileNamespace={props.file.namespace}
                    sourceLocale={props.source_locale}
                    currentLocale={state.currentLocale}
                    availableLocales={props.available_locales}
                    showSource={state.showSource}
                    searchTerm={state.searchTerm}
                    isLoading={navigation.isNavigating}
                    requestCount={navigation.requestCount}
                    progressPercentage={stats.progressPercentage}
                    translatedEntries={stats.translatedEntries}
                    totalEntries={stats.totalEntries}
                    emptyEntries={stats.emptyEntries}
                    dirtyCount={dirtyKeys.length}
                    onBack={handleBack}
                    onLocaleChange={setLocale}
                    onToggleSource={toggleSource}
                    onSearchChange={setSearchTerm}
                    onSearchSubmit={executeSearch}
                    onSearchClear={clearSearch}
                    onRestoreAll={restoreAllSourceValues}
                    onSave={handleSave}
                />

                <TranslationList
                    entries={props.entries}
                    renderRow={(entry) => (
                        <TranslationRow
                            entry={entry}
                            value={draftValues[entry.key] ?? ''}
                            currentLocale={state.currentLocale}
                            sourceLocale={props.source_locale}
                            showSource={state.showSource}
                            isExpanded={state.expandedKeys.includes(entry.key)}
                            isDirty={dirtyKeys.includes(entry.key)}
                            isActive={state.activeKey === entry.key}
                            onToggleExpanded={toggleExpanded}
                            onChangeValue={setDraftValue}
                            onReset={resetDraftValue}
                            onCopySource={async (value) => {
                                await navigator.clipboard.writeText(value);
                            }}
                            onFocusKey={setActiveKey}
                            onFocusNext={focusNextEntry}
                        />
                    )}
                    footer={
                        <TranslationPagination
                            currentPage={state.page}
                            totalPages={props.entries_meta?.total_pages ?? 1}
                            perPage={state.perPage}
                            totalEntries={stats.totalEntries}
                            onPageChange={setPage}
                            onPerPageChange={setPerPage}
                        />
                    }
                />
            </div>

            <UnsavedChangesDialog
                open={leaveDialogOpen}
                onOpenChange={setLeaveDialogOpen}
                onDiscard={handleDiscardAndLeave}
                onContinueEditing={() => setLeaveDialogOpen(false)}
            />
        </>
    );
}
