<?php

use Illuminate\Support\Facades\File;

it('generates named routes only from the specified routes file', function () {
    $testingDir = base_path('storage/framework/testing');
    File::ensureDirectoryExists($testingDir);

    $routesFile = $testingDir.DIRECTORY_SEPARATOR.'wayfinder-routes-test.php';

    File::put($routesFile, <<<'PHP'
<?php

use Illuminate\Support\Facades\Route;

Route::get('/foo', fn () => 'ok')->name('test.foo');
Route::get('/bar', fn () => 'ok')->name('other.bar');
PHP);

    $outputDir = $testingDir.DIRECTORY_SEPARATOR.'wayfinder-output';
    File::deleteDirectory($outputDir);

    $this->artisan('wayfinder:generate-user', [
        '--skip-actions' => true,
        '--routes-file' => 'storage/framework/testing/wayfinder-routes-test.php',
        '--routes-name' => 'test',
        '--path' => $outputDir,
    ])->assertExitCode(0);

    expect(File::exists($outputDir.DIRECTORY_SEPARATOR.'routes'.DIRECTORY_SEPARATOR.'test'.DIRECTORY_SEPARATOR.'index.ts'))->toBeTrue();
    expect(File::exists($outputDir.DIRECTORY_SEPARATOR.'routes'.DIRECTORY_SEPARATOR.'other'.DIRECTORY_SEPARATOR.'index.ts'))->toBeFalse();
});
