<?php

use Modules\Language\Models\Language;
use Modules\Language\Services\TranslationsExporter;

it('flushes cached language queries when a record is created', function () {
    $namespace = 'language';
    $group = 'index';

    expect(Language::getAllLang($namespace, $group))->toHaveCount(0);

    Language::query()->create([
        'key' => 'welcome_message',
        'value' => 'Welcome from DB',
        'language' => 'en',
        'group' => $group,
        'namespace' => $namespace,
    ]);

    expect(Language::getAllLang($namespace, $group))
        ->toHaveCount(1)
        ->first()
        ->key->toBe('welcome_message');
});

it('flushes cached exported translations when a record is updated', function () {
    $namespace = 'language';
    $group = 'index';

    /** @var Language $record */
    $record = Language::query()->create([
        'key' => 'welcome_message',
        'value' => 'Value v1',
        'language' => 'en',
        'group' => $group,
        'namespace' => $namespace,
    ]);

    /** @var TranslationsExporter $exporter */
    $exporter = app(TranslationsExporter::class);

    $first = $exporter->export('en', $namespace, [$group]);

    expect($first['en'][$group]['welcome_message'])->toBe('Value v1');

    $record->update(['value' => 'Value v2']);

    $second = $exporter->export('en', $namespace, [$group]);

    expect($second['en'][$group]['welcome_message'])->toBe('Value v2');
});
