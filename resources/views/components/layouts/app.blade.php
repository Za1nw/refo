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

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @vite(['resources/css/app.css'])


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
    {{ $slot }}
</body>

</html>
