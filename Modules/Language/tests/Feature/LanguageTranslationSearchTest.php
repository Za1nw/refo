<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Language\Services\LanguageTranslationService;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('it normalizes arabic search text including tashkeel and letter variations', function () {
    /** @var LanguageTranslationService $service */
    $service = app(LanguageTranslationService::class);

    expect($service->normalizeSearchText('ابنِ'))->toBe('ابن');
    expect($service->normalizeSearchText('الأكاديمي'))->toBe('الاكاديمي');
    expect($service->normalizeSearchText('أفضل'))->toBe('افضل');
    expect($service->normalizeSearchText('الدراسية'))->toBe('الدراسيه');
    expect($service->normalizeSearchText('إلى'))->toBe('الي');
});

use Modules\Language\Contracts\TranslationFileRepositoryInterface;

test('it accurately ranks translation search results based on relevance and text containment', function () {
    $fileRepo = Mockery::mock(TranslationFileRepositoryInterface::class);
    $fileRepo->shouldReceive('allowedFile')->andReturn([
        'namespace' => 'default',
        'group' => 'client_home',
        'label' => 'Home Page',
    ]);
    $fileRepo->shouldReceive('flattenTranslations')->andReturn([
        'hero_title_part1' => 'ابنِ مستقبلك الأكاديمي مع أفضل المنح الدراسية والجامعات العالمية',
        'hero_title_highlight' => 'أفضل المنح الدراسية',
        'contact_us' => 'تواصل معنا الآن عبر الواتساب',
        'unrelated_arabic' => 'سياسة الخصوصية والشروط والأحكام',
    ]);
    $fileRepo->shouldReceive('readFileTranslations')->andReturn([]);
    $fileRepo->shouldReceive('availableLocales')->andReturn(['ar', 'en']);
    app()->instance(TranslationFileRepositoryInterface::class, $fileRepo);

    /** @var LanguageTranslationService $service */
    $service = app(LanguageTranslationService::class);

    $result = $service->editorPayload(
        namespace: 'default',
        group: 'client_home',
        locale: 'ar',
        indexUrl: '/admin/languages',
        filters: [
            'search' => 'ابن مستقبلك الاكاديمي مع افضل المنح الدراسية',
            'per_page' => 10,
        ],
    );

    expect($result['entries'])->not->toBeEmpty();

    $keys = array_column($result['entries'], 'key');

    // يجب أن يكون hero_title_part1 في مقدمة النتائج (المركز الأول)
    expect($keys[0])->toBe('hero_title_part1');

    // hero_title_highlight يجب أن يكون في المراكز الأولى قبل النصوص العامة
    expect(in_array('hero_title_highlight', array_slice($keys, 0, 3), true))->toBeTrue();
});

test('it does not return unrelated arabic entries on single token search due to byte similarity', function () {
    $fileRepo = Mockery::mock(TranslationFileRepositoryInterface::class);
    $fileRepo->shouldReceive('allowedFile')->andReturn([
        'namespace' => 'default',
        'group' => 'client_home',
        'label' => 'Home Page',
    ]);
    $fileRepo->shouldReceive('flattenTranslations')->andReturn([
        'privacy_policy' => 'سياسة الخصوصية والشروط والأحكام لجامعات اليمن',
        'irrelevant_footer' => 'حقوق النشر والتوزيع محفوظة لدى شركة التقنية',
    ]);
    $fileRepo->shouldReceive('readFileTranslations')->andReturn([]);
    $fileRepo->shouldReceive('availableLocales')->andReturn(['ar', 'en']);
    app()->instance(TranslationFileRepositoryInterface::class, $fileRepo);

    /** @var LanguageTranslationService $service */
    $service = app(LanguageTranslationService::class);

    // البحث بكلمة واحدة لا توجد في أي من السجلات أعلاه
    $result = $service->editorPayload(
        namespace: 'default',
        group: 'client_home',
        locale: 'ar',
        indexUrl: '/admin/languages',
        filters: [
            'search' => 'طالب',
            'per_page' => 10,
        ],
    );

    // يجب أن تكون النتائج فارغة تماماً ولا تحتوي على سجلات زائفة بسبب البايتات المشتركة
    expect($result['entries'])->toBeEmpty();
});
