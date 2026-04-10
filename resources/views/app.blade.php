<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <!-- google site verification -->
        <meta name="google-site-verification" content="Sx6feX4ZcWsScQKKZhPgQKGi1d-jpsGVnwzn_f721E4" />
        <base href="/" />
        <title inertia>StoriVault</title>

        <!-- Canonical Link -->
        <link rel="canonical" href="{{ request()->routeIs('home') ? 'https://www.storievault.com/' : url()->current() }}" />

        <!-- Google Analytics (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PJW3ZTKPGD"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PJW3ZTKPGD');
        </script>

        <!-- Favicons -->
        <link rel="icon" href="{{ asset('assets/images/fav.png') }}" type="image/png" />
        <link rel="shortcut icon" href="{{ asset('assets/images/fav.png') }}" type="image/png" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

        <!-- Font Awesome -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

         <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    {{-- <script src="{{ asset('assets/turn/turn.min.js') }}"></script> --}}
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="tertiary-font">
        @inertia
    </body>
</html>
