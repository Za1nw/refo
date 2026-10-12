<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}"
    @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? 'system' }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    <x-inertia::head>
        <title>{{ config('app.name', 'Laravel') }}</title>
    </x-inertia::head>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    @php
        $module = $page['props']['module'] ?? null;
        if ($module) {
            $component = $page['component'] ?? null;
            // Module::Component format قص Component مع تأكد يجب قبل فحص تكون كل الحروف صغيره
            if ($component && str_starts_with(strtolower($component), strtolower($module . '::'))) {
                // قص اسم المكون من اسم الموديول
                $componentName = substr($component, strlen($module . '::'));
                // تحويل اسم المكون إلى مسار ملف جافا سكريبت
                $jsFilePath = [
                    "Modules/{$module}/resources/assets/admin/pages/{$componentName}.tsx",
                    'resources/admin/app.tsx',
                ];
            }
        }
    @endphp

    <script>
        // Initialize theme/settings globals BEFORE loading the app bundle
        (function() {
            try {
                const radius = {!! json_encode(setting('radius')) !!};
                if (typeof radius !== 'undefined' && radius !== null) {
                    window.__radius = Number(radius);
                } else {
                    window.__radius = 0.625;
                }

                const menuStyle = {!! json_encode(setting('menuStyle')) !!};
                window.__menuStyle = menuStyle ? String(menuStyle).toLowerCase() : 'inset';
            } catch (e) {
                console.error(e);
                window.__radius = 0.625;
                window.__menuStyle = 'inset';
            }
        })();
    </script>

    @fonts

    @viteReactRefresh
    @vite($jsFilePath ?? ['resources/admin/app.tsx'])
    @vite('resources/css/app.css')

    <style>
        :root {
            @if (setting('primary_color'))
                --primary: {{ setting('primary_color') }};
            @endif

            @if (setting('secondary_color'))
                --secondary: {{ setting('secondary_color') }};
            @endif

            @if (setting('primary_color'))
                --sidebar-primary: {{ setting('primary_color') }};
            @endif

            @if (setting('radius'))
                --radius: {{ setting('radius') }}rem;
            @endif
        }
    </style>

</head>

<body class="font-sans antialiased">
    <x-inertia::app />
</body>

</html>
