<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Routing\Route as BaseRoute;
use Illuminate\Routing\Router;
use Illuminate\Routing\UrlGenerator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\View\Factory;
use Laravel\Wayfinder\Parameter;
use Laravel\Wayfinder\Route;
use Laravel\Wayfinder\TypeScript;
use ReflectionProperty;

use function Illuminate\Filesystem\join_paths;
use function Laravel\Prompts\info;

class GenerateUserRoutes extends Command
{
    protected $signature = 'wayfinder:generate-user {--path=} {--skip-actions} {--routes-name= : Specify which routes name to process --routes-name=user,profile,home (e.g., user, profile, home)} {--routes-file= : Comma-separated route sources to load (web, api, settings) or file paths (e.g., routes/web.php, web:routes/custom.php)} {--skip-routes} {--with-form}';

    private ?string $forcedScheme;

    private ?string $forcedRoot;

    private $urlDefaults = [];

    private $pathDirectory = 'actions';

    private $content = [];

    /**
     * Imports array where the key is the generated file path and the value is an array of imports.
     * Each import is an array where the first element is the import path and the second element is an array of imported items.
     *
     * @var array<string, array<string, string[]>>
     */
    private $imports = [];
    private $path_base;

    public function __construct(
        private Filesystem $files,
        private Router $router,
        private Factory $view,
        private UrlGenerator $url,
    ) {
        $this->path_base = __DIR__ . '/../../../vendor/laravel/wayfinder/resources';
        parent::__construct();
    }

    private function str_starts_with_any(?string $haystack, array $needles): bool
    {
        $haystack ??= '';
        foreach ($needles as $needle) {
            if (strpos($haystack, $needle) === 0) {
                return true;
            }
        }
        return false;
    }

    public function handle(): int
    {
        $routesFileOption = $this->option('routes-file');
        $nameFilter = explode(',', $this->option('routes-name') ?? '');
        $this->view->addNamespace('wayfinder', $this->path_base);
        $this->view->addExtension('blade.ts', 'blade');
        $this->forcedScheme = (new ReflectionProperty($this->url, 'forceScheme'))->getValue($this->url);
        $this->forcedRoot = (new ReflectionProperty($this->url, 'forcedRoot'))->getValue($this->url);

        $globalUrlDefaults = collect(URL::getDefaultParameters())->map(fn($v) => is_scalar($v) || is_null($v) ? $v : '');

        $baseRoutes = $this->collectBaseRoutes($routesFileOption);

        $routes = $baseRoutes->map(function (BaseRoute $route) use ($globalUrlDefaults) {
            $defaults = collect($this->router->gatherRouteMiddleware($route))->map(function ($middleware) {
                if ($middleware instanceof \Closure) {
                    return [];
                }

                $this->urlDefaults[$middleware] ??= $this->getDefaultsForMiddleware($middleware);

                return $this->urlDefaults[$middleware];
            })->flatMap(fn($r) => $r);

            return new Route($route, $globalUrlDefaults->merge($defaults), $this->forcedScheme, $this->forcedRoot);
        });

        if (!$this->option('skip-actions')) {
            $this->files->deleteDirectory($this->base());

            $controllers = $routes->filter(function (Route $route) use ($nameFilter) {
                return $this->str_starts_with_any($route->name(), $nameFilter) && $route->hasController();
            })->groupBy(fn(Route $route) => $route->dotNamespace());

            $controllers->undot()->each($this->writeBarrelFiles(...));
            $controllers->each($this->writeControllerFile(...));

            $this->writeContent();

            info('[Wayfinder] Generated actions in ' . $this->base());
        }

        $this->pathDirectory = 'routes';

        if (! $this->option('skip-routes')) {
            $this->files->deleteDirectory($this->base());

            $named = $routes->filter(function (Route $route) use ($nameFilter) {
                return $this->str_starts_with_any($route->name(), $nameFilter);
            })->groupBy(fn(Route $route) => $route->name());
            $named->each($this->writeNamedFile(...));
            $named->undot()->each($this->writeBarrelFiles(...));

            $this->writeContent();

            info('[Wayfinder] Generated routes in ' . $this->base());
        }

        $this->pathDirectory = 'wayfinder';

        $this->files->ensureDirectoryExists($this->base());
        $this->files->copy($this->path_base . '/js/wayfinder.ts', join_paths($this->base(), 'index.ts'));

        return self::SUCCESS;
    }

    /**
     * @return Collection<int, BaseRoute>
     */
    private function collectBaseRoutes(mixed $routesFileOption): Collection
    {
        if (! is_string($routesFileOption) || trim($routesFileOption) === '') {
            return collect($this->router->getRoutes());
        }

        $sources = collect(explode(',', $routesFileOption))
            ->map(fn($value) => trim((string) $value))
            ->filter();

        $sources = $this->normalizeRouteSources($sources);

        if ($sources->isEmpty()) {
            return collect($this->router->getRoutes());
        }

        $originalRouter = app('router');
        $tempRouter = new Router(app('events'), app());

        $this->copyRouterConfiguration($originalRouter, $tempRouter);

        app()->instance('router', $tempRouter);
        Facade::clearResolvedInstance('router');

        try {
            foreach ($sources as $source) {
                $this->registerRoutesFromSource($tempRouter, $source);
            }
        } finally {
            app()->instance('router', $originalRouter);
            Facade::clearResolvedInstance('router');
        }

        return collect($tempRouter->getRoutes());
    }

    /**
     * @param Collection<int, string> $sources
     * @return Collection<int, array{type: 'web'|'api', path: string}>
     */
    private function normalizeRouteSources(Collection $sources): Collection
    {
        $normalized = $sources->map(function (string $source): array {
            $type = null;
            $path = $source;

            if (str_contains($source, ':')) {
                [$maybeType, $maybePath] = explode(':', $source, 2);
                $maybeType = trim($maybeType);
                $maybePath = trim($maybePath);

                if (in_array($maybeType, ['web', 'api'], true) && $maybePath !== '') {
                    $type = $maybeType;
                    $path = $maybePath;
                }
            }

            $path = $this->resolveRouteFilePath($path);

            if ($type === null) {
                $basename = basename(str_replace('\\', '/', $path));

                $type = match ($basename) {
                    'api.php' => 'api',
                    default => 'web',
                };
            }

            return ['type' => $type, 'path' => $path];
        });

        // Avoid double-loading: routes/web.php already requires routes/settings.php
        $hasWeb = $normalized->contains(fn($s) => basename(str_replace('\\', '/', $s['path'])) === 'web.php');

        if ($hasWeb) {
            $normalized = $normalized->reject(fn($s) => basename(str_replace('\\', '/', $s['path'])) === 'settings.php');
        }

        return $normalized->unique(fn($s) => $s['type'] . '|' . $s['path'])->values();
    }

    private function resolveRouteFilePath(string $value): string
    {
        $value = trim($value);

        if (in_array($value, ['web', 'api', 'settings'], true)) {
            $value = 'routes/' . $value . '.php';
        }

        $isWindowsAbsolutePath = (bool) preg_match('~^[A-Za-z]:[\\\\/]~', $value);
        $path = $isWindowsAbsolutePath ? $value : base_path($value);

        if (! $this->files->exists($path)) {
            throw new \InvalidArgumentException("[Wayfinder] Route file not found: {$value}");
        }

        return $path;
    }

    /**
     * @param array{type: 'web'|'api', path: string} $source
     */
    private function registerRoutesFromSource(Router $router, array $source): void
    {
        $attributes = match ($source['type']) {
            'api' => ['prefix' => 'api', 'middleware' => ['api']],
            default => ['middleware' => ['web']],
        };

        $router->group($attributes, $source['path']);
    }

    private function copyRouterConfiguration(Router $from, Router $to): void
    {
        foreach (['middleware', 'middlewareGroups', 'middlewarePriority'] as $property) {
            if (! property_exists($from, $property) || ! property_exists($to, $property)) {
                continue;
            }

            $reflection = new \ReflectionProperty($from, $property);
            $reflection->setAccessible(true);
            $value = $reflection->getValue($from);
            $reflection->setValue($to, $value);
        }
    }

    private function appendContent($path, $content): void
    {
        $this->content[$path] ??= [];

        if (! in_array($content, $this->content[$path])) {
            $this->content[$path][] = $content;
        }
    }

    private function prependContent($path, $content): void
    {
        $this->content[$path] ??= [];

        array_unshift($this->content[$path], $content);
    }

    private function writeContent(): void
    {
        foreach ($this->content as $path => $content) {
            $path = rtrim($path, "/\\");
            $this->files->ensureDirectoryExists(dirname($path));
            $this->files->put($path, TypeScript::cleanUp(implode(PHP_EOL, $content)));

            // Prepend the imports to the file
            if (isset($this->imports[$path])) {
                $importLines = collect($this->imports[$path])->map(fn($imports, $key) => 'import { ' . implode(', ', array_unique($imports)) . " } from '{$key}'")->implode(PHP_EOL);
                $this->files->prepend($path, $importLines . PHP_EOL);
            }
        }

        $this->content = [];
    }

    private function writeControllerFile(Collection $routes, string $namespace): void
    {
        $path = join_paths($this->base(), ...explode('.', $namespace)) . '.ts';

        $this->appendCommonImports($routes, $path, $namespace);

        $routes->groupBy(fn(Route $route) => $route->method())->each(function ($methodRoutes) use ($path) {
            if ($methodRoutes->count() === 1) {
                return $this->writeControllerMethodExport($methodRoutes->first(), $path);
            }

            return $this->writeMultiRouteControllerMethodExport($methodRoutes, $path);
        });

        [$invokable, $methods] = $routes->partition(fn(Route $route) => $route->hasInvokableController());

        $defaultExport = $invokable->isNotEmpty() ? $invokable->first()->jsMethod() : last(explode('.', $namespace));

        if ($invokable->isEmpty()) {
            $exportedMethods = $methods->map(fn(Route $route) => $route->jsMethod());
            $reservedMethods = $methods->filter(fn(Route $route) => $route->originalJsMethod() !== $route->jsMethod())->map(fn(Route $route) => TypeScript::quoteIfNeeded($route->originalJsMethod()) . ': ' . $route->jsMethod());
            $exportedMethods = $exportedMethods->merge($reservedMethods);

            $methodProps = "const {$defaultExport} = { ";
            $methodProps .= $exportedMethods->unique()->implode(', ');
            $methodProps .= ' }';
        } else {
            $methodProps = $methods->map(fn(Route $route) => $defaultExport . '.' . $route->jsMethod() . ' = ' . $route->jsMethod())->unique()->implode(PHP_EOL);
        }

        $this->appendContent($path, <<<JAVASCRIPT
        {$methodProps}

        export default {$defaultExport}
        JAVASCRIPT);
    }

    private function writeMultiRouteControllerMethodExport(Collection $routes, string $path): void
    {
        $isInvokable = $routes->first()->hasInvokableController();

        $this->appendContent($path, $this->view->make('wayfinder::multi-method', [
            'method' => $routes->first()->jsMethod(),
            'original_method' => $routes->first()->originalJsMethod(),
            'path' => $routes->first()->controllerPath(),
            'line' => $routes->first()->controllerMethodLineNumber(),
            'controller' => $routes->first()->controller(),
            'isInvokable' => $isInvokable,
            'shouldExport' => ! $isInvokable,
            'withForm' => $this->option('with-form') ?? false,
            'routes' => $routes->map(fn($r) => [
                'method' => $r->jsMethod(),
                'tempMethod' => $r->jsMethod() . hash('xxh128', $r->uri()),
                'parameters' => $r->parameters(),
                'verbs' => $r->verbs(),
                'uri' => $r->uri(),
            ]),
        ]));
    }

    private function writeControllerMethodExport(Route $route, string $path): void
    {
        $this->appendContent($path, $this->view->make('wayfinder::method', [
            'controller' => $route->controller(),
            'method' => $route->jsMethod(),
            'original_method' => $route->originalJsMethod(),
            'isInvokable' => $route->hasInvokableController(),
            'shouldExport' => ! $route->hasInvokableController(),
            'path' => $route->controllerPath(),
            'line' => $route->controllerMethodLineNumber(),
            'parameters' => $route->parameters(),
            'verbs' => $route->verbs(),
            'uri' => $route->uri(),
            'withForm' => $this->option('with-form') ?? false,
        ]));
    }

    private function writeNamedFile(Collection $routes, string $namespace): void
    {
        $parts = explode('.', $namespace);
        array_pop($parts);
        $parts[] = 'index';

        $path = join_paths($this->base(), ...$parts) . '.ts';

        $this->appendCommonImports($routes, $path, $namespace);

        $routes->each(fn(Route $route) => $this->writeNamedMethodExport($route, $path));
    }

    private function appendCommonImports(Collection $routes, string $path, string $namespace): void
    {
        $imports = ['queryParams', 'type RouteQueryOptions', 'type RouteDefinition'];

        if ($this->option('with-form') === true) {
            $imports[] = 'type RouteFormDefinition';
        }

        if ($routes->contains(fn(Route $route) => $route->parameters()->isNotEmpty())) {
            $imports[] = 'applyUrlDefaults';
        }

        if ($routes->contains(fn(Route $route) => $route->parameters()->contains(fn(Parameter $parameter) => $parameter->optional))) {
            $imports[] = 'validateParameters';
        }

        $importBase = str_repeat('/..', substr_count($namespace, '.') + 1);
        $pathKey = ".{$importBase}/wayfinder";

        $this->imports[$path] ??= [];
        $this->imports[$path][$pathKey] = [
            ...($this->imports[$path][$pathKey] ?? []),
            ...$imports,
        ];
    }

    private function writeNamedMethodExport(Route $route, string $path): void
    {
        $this->appendContent($path, $this->view->make('wayfinder::method', [
            'controller' => $route->controller(),
            'method' => $route->namedMethod(),
            'original_method' => $route->originalJsMethod(),
            'isInvokable' => $route->hasInvokableController(),
            'shouldExport' => true,
            'path' => $route->controllerPath(),
            'line' => $route->controllerMethodLineNumber(),
            'parameters' => $route->parameters(),
            'verbs' => $route->verbs(),
            'uri' => $route->uri(),
            'withForm' => $this->option('with-form') ?? false,
        ]));
    }

    private function writeBarrelFiles(array|Collection $children, string $parent): void
    {
        $children = collect($children);

        if (array_is_list($children->all())) {
            return;
        }

        $indexPath = join_paths($this->base(), $parent, 'index.ts');

        $childKeys = $children->keys()->mapWithKeys(fn($child) => [
            $child => [
                'safe' => TypeScript::safeMethod($child, 'Method'),
                'normalized' => str($child)->whenContains('-', fn($s) => $s->camel())->toString(),
            ],
        ]);

        if (! ($this->content[$indexPath] ?? false)) {
            $imports = $childKeys->filter(fn($_, $key) => $key !== 'index')->map(fn($alias, $key) => "import {$alias['safe']} from './{$key}'")->implode(PHP_EOL);
        } else {
            $keysWithGrandkids = $children->filter(fn($grandChildren) => ! array_is_list(collect($grandChildren)->all()));
            $imports = $childKeys->only($keysWithGrandkids->keys())->map(fn($alias, $key) => "import {$alias['safe']} from './{$key}'")->implode(PHP_EOL);
        }

        if ($imports) {
            $this->prependContent($indexPath, $imports);
        }

        $keys = $childKeys->map(fn($alias, $key) => str_repeat(' ', 4) . implode(': ', array_unique([$alias['normalized'], $alias['safe']])))->implode(', ' . PHP_EOL);

        $varExport = TypeScript::safeMethod(Str::afterLast($parent, DIRECTORY_SEPARATOR), 'Method');

        $this->appendContent($indexPath, <<<JAVASCRIPT


                const {$varExport} = {
                {$keys},
                }

                export default {$varExport}
                JAVASCRIPT);

        $children->each(fn($grandChildren, $child) => $this->writeBarrelFiles($grandChildren, join_paths($parent, $child)));
    }

    private function base(): string
    {
        $base = $this->option('path') ?? join_paths(resource_path(), 'js');

        return join_paths($base, $this->pathDirectory);
    }

    private function getDefaultsForMiddleware(string $middleware)
    {
        if (! class_exists($middleware)) {
            return [];
        }

        $reflection = new \ReflectionClass($middleware);

        if (! $reflection->hasMethod('handle')) {
            return [];
        }

        $method = $reflection->getMethod('handle');

        // Get the file name and line numbers
        $fileName = $method->getFileName();
        $startLine = $method->getStartLine();
        $endLine = $method->getEndLine();

        // Read the file and extract the method contents
        $lines = file($fileName);
        $methodContents = implode('', array_slice($lines, $startLine - 1, $endLine - $startLine + 1));

        if (! str_contains($methodContents, 'URL::defaults')) {
            return [];
        }

        $methodContents = str($methodContents)->after('{')->beforeLast('}')->trim();

        return $this->extractUrlDefaults($methodContents);
    }

    private function extractUrlDefaults(string $methodContents): array
    {
        $tokens = token_get_all('<?php ' . $methodContents);
        $foundUrlFacade = false;
        $defaults = [];
        $inArray = false;

        foreach ($tokens as $index => $token) {
            if (is_array($token) && token_name($token[0]) === 'T_STRING') {
                if (
                    $token[1] === 'URL'
                    && is_array($tokens[$index + 1])
                    && $tokens[$index + 1][1] === '::'
                    && is_array($tokens[$index + 2])
                    && $tokens[$index + 2][1] === 'defaults'
                ) {
                    $foundUrlFacade = true;
                }
            }

            if (! $foundUrlFacade) {
                continue;
            }

            if ((is_array($token) && $token[0] === T_ARRAY) || $token === '[') {
                $inArray = true;
            }

            // If we are in an array context and the token is a string (key)
            if (! $inArray) {
                continue;
            }

            if (is_array($token) && $token[0] === T_DOUBLE_ARROW) {
                $count = 1;
                $previousToken = $tokens[$index - $count];

                // Work backwards to get the key
                while (is_array($previousToken) && $previousToken[0] === T_WHITESPACE) {
                    $count++;
                    $previousToken = $tokens[$index - $count];
                }

                $valueToken = $tokens[$index + 1];
                $count = 1;

                // Work backwards to get the key
                while (is_array($valueToken) && $valueToken[0] === T_WHITESPACE) {
                    $count++;
                    $valueToken = $tokens[$index + $count];
                }

                $value = trim($valueToken[1], "'\"");

                $value = match ($value) {
                    'true' => 1,
                    'false' => 0,
                    default => $value,
                };

                $defaults[trim($previousToken[1], "'\"")] = $value;
            }

            // Check for the closing bracket of the array
            if ($token === ']') {
                $inArray = false;
                break;
            }
        }

        return $defaults;
    }
}
