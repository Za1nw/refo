<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

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

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia>{{ $page['props']['module'] ?? config('app.name', 'Laravel') }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
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
                    "Modules/{$module}/resources/assets/js/pages/{$componentName}.tsx",
                    'resources/js/app.tsx',
                ];
            }
        }
    @endphp
    @viteReactRefresh
    @vite($jsFilePath ?? ['resources/js/app.tsx', 'resources/css/app.css'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
