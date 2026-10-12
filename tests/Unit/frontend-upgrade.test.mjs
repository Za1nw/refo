import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { getCoreRowModel, useLegacyTable } from '@tanstack/react-table/legacy';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from '../../resources/admin/components/tiptap/extension/font-size.ts';
import { TextDirection } from '../../resources/admin/components/tiptap/extension/text-direction.ts';
import LinkExtended from '../../resources/admin/components/tiptap/extensions/linkExtended.ts';
import ListExtended from '../../resources/admin/components/tiptap/extensions/listExtended.ts';
import useStudioImages from '../../resources/admin/hooks/useStudioImages.ts';

function createEditor(extensions) {
    return new Editor({
        element: null,
        extensions,
        content: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Example' }] }],
        },
    });
}

test('image studio uses the supplied fetch handler and forwards the search', async () => {
    let studio;
    const requests = [];
    const handlers = {
        fetchImages: async (page, search) => {
            requests.push({ page, search });
            return { data: [], has_more: false, next_page: null };
        },
    };

    function StudioProbe() {
        studio = useStudioImages(handlers, false);
        return null;
    }

    renderToString(createElement(StudioProbe));
    await studio.loadImages('example');
    assert.deepEqual(requests, [{ page: 1, search: 'example' }]);
});

test('table compatibility preserves server pagination, row order and sorting callbacks', () => {
    let table;
    let nextSorting;
    const sorting = [];

    function TableProbe() {
        table = useLegacyTable({
            data: [{ title: 'Zulu' }, { title: 'Alpha' }],
            columns: [{ accessorKey: 'title' }],
            getCoreRowModel: getCoreRowModel(),
            manualPagination: true,
            manualSorting: true,
            pageCount: 7,
            state: { pagination: { pageIndex: 2, pageSize: 10 }, sorting },
            onSortingChange: (updater) => {
                nextSorting = typeof updater === 'function' ? updater(sorting) : updater;
            },
        });
        return createElement('span', null, table.getRowModel().rows.length);
    }

    assert.equal(renderToString(createElement(TableProbe)), '<span>2</span>');
    assert.equal(table.getPageCount(), 7);
    assert.equal(table.getState().pagination.pageIndex, 2);
    assert.deepEqual(table.getRowModel().rows.map((row) => row.original.title), ['Zulu', 'Alpha']);
    table.getColumn('title').toggleSorting(false);
    assert.deepEqual(nextSorting, [{ id: 'title', desc: false }]);
});

test('font size commands preserve units and remove empty text style marks', () => {
    const editor = createEditor([StarterKit, TextStyle, FontSize]);
    try {
        editor.commands.setTextSelection({ from: 1, to: 8 });
        assert.equal(editor.commands.setFontSize('18'), true);
        assert.equal(editor.getAttributes('textStyle').fontSize, '18px');
        editor.commands.setFontSize('1.25rem');
        assert.equal(editor.getAttributes('textStyle').fontSize, '1.25rem');
        editor.commands.unsetFontSize();
        assert.equal(editor.isActive('textStyle'), false);
    } finally {
        editor.destroy();
    }
});

test('custom block direction coexists with the built-in text direction command', () => {
    const editor = createEditor([StarterKit, TextDirection]);
    try {
        const names = editor.extensionManager.extensions.map((extension) => extension.name);
        assert.equal(new Set(names).size, names.length);
        assert.equal(typeof editor.commands.setTextDirection, 'function');
        assert.equal(editor.commands.setBlockTextDirection('rtl'), true);
        assert.equal(editor.getJSON().content[0].attrs.dir, 'rtl');
        editor.commands.unsetTextDirection();
        assert.equal(editor.getJSON().content[0].attrs.dir, null);
    } finally {
        editor.destroy();
    }
});

test('extended links retain custom attributes and support removal', () => {
    const editor = createEditor([StarterKit.configure({ link: false }), LinkExtended]);
    try {
        editor.commands.setTextSelection({ from: 1, to: 8 });
        assert.equal(editor.commands.setLinkExtended({ href: 'https://example.com', title: 'Example' }), true);
        assert.equal(editor.getAttributes('link').title, 'Example');
        editor.commands.unsetLinkExtended();
        assert.equal(editor.isActive('link'), false);
    } finally {
        editor.destroy();
    }
});

test('extended lists register all list schemas and commands with Tiptap 3', () => {
    const editor = createEditor([
        StarterKit.configure({ bulletList: false, orderedList: false, listItem: false }),
        ListExtended,
    ]);
    try {
        for (const name of ['bulletList', 'orderedList', 'listItem', 'symbolList']) {
            assert.ok(editor.schema.nodes[name]);
        }
        assert.equal(typeof editor.commands.toggleListType, 'function');
        assert.equal(typeof editor.commands.indentList, 'function');
        assert.equal(typeof editor.commands.outdentList, 'function');
    } finally {
        editor.destroy();
    }
});
