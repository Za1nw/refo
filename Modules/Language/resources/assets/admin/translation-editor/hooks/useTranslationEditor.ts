import { useMemo, useCallback, useState, useEffect } from 'react';
import { useRemember } from '@inertiajs/react';
import { router } from '@inertiajs/react';

import type { TranslationEditorPageProps, TranslationEntryRow, TranslationEditorQuery, TranslationEditorState } from '../types/translation-editor';
import { calculateTranslationStats } from '../utils/calculateTranslationStats';
import { buildTranslationQuery } from '../utils/buildTranslationQuery';
import { useTranslationNavigation } from './useTranslationNavigation';
import { useExpandedRows } from './useExpandedRows';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';

function buildRememberKey(props: TranslationEditorPageProps) {
    return `translation-editor:${props.file.namespace}:${props.file.group}:${props.locale}`;
}

function createInitialState(props: TranslationEditorPageProps): TranslationEditorState {
    return {
        currentLocale: props.locale,
        searchTerm: props.filters?.search ?? '',
        page: props.entries_meta?.current_page ?? 1,
        perPage: props.entries_meta?.per_page ?? 100,
        showSource: true,
        expandedKeys: props.entries.map((entry: TranslationEntryRow) => entry.key),
        activeKey: null,
        requestCount: 0,
        draftValuesByLocale: {},
        dirtyKeysByLocale: {},
    };
}

function getLocaleDrafts(state: TranslationEditorState, locale: string): Record<string, string> {
    return state.draftValuesByLocale[locale] ?? {};
}

function getLocaleDirtyKeys(state: TranslationEditorState, locale: string): string[] {
    return state.dirtyKeysByLocale[locale] ?? [];
}

export function useTranslationEditor(props: TranslationEditorPageProps) {
    const rememberKey = useMemo(() => buildRememberKey(props), [props.file.namespace, props.file.group, props.locale]);
    const [state, setState] = useRemember<TranslationEditorState>(createInitialState(props), rememberKey);

    const entriesByKey = useMemo(() => new Map<string, TranslationEntryRow>(props.entries.map((entry: TranslationEntryRow) => [entry.key, entry])), [props.entries]);
    const stats = useMemo(() => calculateTranslationStats(props.entries, props.total_entries, props.translated_count), [props.entries, props.total_entries, props.translated_count]);

    const navigation = useTranslationNavigation(props.edit_url);

    useUnsavedChangesGuard(getLocaleDirtyKeys(state, state.currentLocale).length > 0);

    const draftValues = useMemo(() => {
        const localeDrafts = getLocaleDrafts(state, state.currentLocale);
        const nextDrafts: Record<string, string> = {};

        for (const entry of props.entries) {
            nextDrafts[entry.key] = localeDrafts[entry.key] ?? entry.value ?? '';
        }

        return nextDrafts;
    }, [props.entries, state, state.currentLocale]);

    const dirtyKeys = useMemo(() => {
        const localeDirtyKeys = getLocaleDirtyKeys(state, state.currentLocale);
        const dirtySet = new Set(localeDirtyKeys);

        if (dirtySet.size > 0) {
            return localeDirtyKeys;
        }

        return props.entries.filter((entry: TranslationEntryRow) => (draftValues[entry.key] ?? '') !== (entry.value ?? '')).map((entry: TranslationEntryRow) => entry.key);
    }, [draftValues, props.entries, state, state.currentLocale]);

    const setDraftValue = useCallback((entryKey: string, value: string) => {
        setState((previous) => {
            const currentLocaleDrafts = previous.draftValuesByLocale[previous.currentLocale] ?? {};
            const currentLocaleDirtyKeys = new Set(previous.dirtyKeysByLocale[previous.currentLocale] ?? []);
            const originalValue = entriesByKey.get(entryKey)?.value ?? '';

            const nextDraftValuesByLocale = {
                ...previous.draftValuesByLocale,
                [previous.currentLocale]: {
                    ...currentLocaleDrafts,
                    [entryKey]: value,
                },
            };

            if (value !== originalValue) {
                currentLocaleDirtyKeys.add(entryKey);
            } else {
                currentLocaleDirtyKeys.delete(entryKey);
            }

            return {
                ...previous,
                draftValuesByLocale: nextDraftValuesByLocale,
                dirtyKeysByLocale: {
                    ...previous.dirtyKeysByLocale,
                    [previous.currentLocale]: Array.from(currentLocaleDirtyKeys),
                },
            };
        });
    }, [entriesByKey, setState]);

    const saveTranslations = useCallback((updateUrl: string) => {
        const localeDrafts = getLocaleDrafts(state, state.currentLocale);

        router.patch(updateUrl, {
            locale: state.currentLocale,
            translations: localeDrafts,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setState((previous) => ({
                    ...previous,
                    dirtyKeysByLocale: {
                        ...previous.dirtyKeysByLocale,
                        [previous.currentLocale]: [],
                    },
                }));
            },
        });
    }, [setState, state]);

    const resetDraftValue = useCallback((entryKey: string) => {
        const sourceValue = entriesByKey.get(entryKey)?.source_value ?? '';
        setDraftValue(entryKey, sourceValue);
    }, [entriesByKey, setDraftValue]);

    const restoreAllSourceValues = useCallback(() => {
        router.patch(props.update_url, {
            locale: state.currentLocale,
            restore_source: true,
        }, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setState((previous) => ({
                    ...previous,
                    draftValuesByLocale: {
                        ...previous.draftValuesByLocale,
                        [previous.currentLocale]: {},
                    },
                    dirtyKeysByLocale: {
                        ...previous.dirtyKeysByLocale,
                        [previous.currentLocale]: [],
                    },
                }));
            },
        });
    }, [props.update_url, setState, state.currentLocale]);

    const discardCurrentLocaleDrafts = useCallback(() => {
        setState((previous) => ({
            ...previous,
            draftValuesByLocale: {
                ...previous.draftValuesByLocale,
                [previous.currentLocale]: {},
            },
            dirtyKeysByLocale: {
                ...previous.dirtyKeysByLocale,
                [previous.currentLocale]: [],
            },
        }));
    }, [setState]);

    const setSearchTerm = useCallback((value: string) => {
        setState((previous) => ({ ...previous, searchTerm: value }));
    }, [setState]);

    const executeSearch = useCallback((value?: string) => {
        const term = (value !== undefined ? value : state.searchTerm).trim();
        navigation.navigate(buildTranslationQuery({
            locale: state.currentLocale,
            page: 1,
            per_page: state.perPage,
            search: term,
        }));
    }, [navigation, state.currentLocale, state.perPage, state.searchTerm]);

    const clearSearch = useCallback(() => {
        setState((previous) => ({ ...previous, searchTerm: '' }));
        navigation.navigate(buildTranslationQuery({
            locale: state.currentLocale,
            page: 1,
            per_page: state.perPage,
            search: '',
        }));
    }, [navigation, setState, state.currentLocale, state.perPage]);

    const setLocale = useCallback((nextLocale: string) => {
        setState((previous) => ({
            ...previous,
            currentLocale: nextLocale,
            page: 1,
            activeKey: null,
        }));

        navigation.navigate(buildTranslationQuery({
            locale: nextLocale,
            page: 1,
            per_page: state.perPage,
            search: state.searchTerm,
        }));
    }, [navigation, setState, state.perPage, state.searchTerm]);

    const setPage = useCallback((nextPage: number) => {
        setState((previous) => ({ ...previous, page: nextPage }));
        navigation.navigate(buildTranslationQuery({
            locale: state.currentLocale,
            page: nextPage,
            per_page: state.perPage,
            search: state.searchTerm,
        }));
    }, [navigation, setState, state.currentLocale, state.perPage, state.searchTerm]);

    const setPerPage = useCallback((nextPerPage: number) => {
        setState((previous) => ({ ...previous, perPage: nextPerPage, page: 1 }));
        navigation.navigate(buildTranslationQuery({
            locale: state.currentLocale,
            page: 1,
            per_page: nextPerPage,
            search: state.searchTerm,
        }));
    }, [navigation, setState, state.currentLocale, state.searchTerm]);

    const expandedRows = useExpandedRows(state.expandedKeys);

    const setActiveKey = useCallback((entryKey: string | null) => {
        setState((previous) => ({ ...previous, activeKey: entryKey }));
    }, [setState]);

    const toggleSource = useCallback(() => {
        setState((previous) => ({ ...previous, showSource: !previous.showSource }));
    }, [setState]);

    const expandAll = useCallback(() => {
        expandedRows.expandAll(props.entries.map((entry: TranslationEntryRow) => entry.key));
        setState((previous) => ({ ...previous, expandedKeys: props.entries.map((entry: TranslationEntryRow) => entry.key) }));
    }, [expandedRows, props.entries, setState]);

    const collapseAll = useCallback(() => {
        expandedRows.collapseAll();
        setState((previous) => ({ ...previous, expandedKeys: [] }));
    }, [expandedRows, setState]);

    const toggleExpanded = useCallback((entryKey: string) => {
        setState((previous) => {
            const nextKeys = previous.expandedKeys.includes(entryKey)
                ? previous.expandedKeys.filter((key) => key !== entryKey)
                : [...previous.expandedKeys, entryKey];

            return { ...previous, expandedKeys: nextKeys };
        });
    }, [setState]);

    const focusNextEntry = useCallback((entryKey: string) => {
        const currentIndex = props.entries.findIndex((entry: TranslationEntryRow) => entry.key === entryKey);
        const nextEntry = props.entries[currentIndex + 1];
        if (!nextEntry) {
            return;
        }

        setState((previous) => ({ ...previous, activeKey: nextEntry.key }));
    }, [props.entries, setState]);

    const hasUnsavedChanges = dirtyKeys.length > 0;

    return {
        state,
        stats,
        navigation,
        draftValues,
        dirtyKeys,
        hasUnsavedChanges,
        saveTranslations,
        setSearchTerm,
        executeSearch,
        clearSearch,
        setLocale,
        setPage,
        setPerPage,
        setActiveKey,
        setDraftValue,
        resetDraftValue,
        restoreAllSourceValues,
        discardCurrentLocaleDrafts,
        toggleSource,
        expandAll,
        collapseAll,
        toggleExpanded,
        focusNextEntry,
    };
}

