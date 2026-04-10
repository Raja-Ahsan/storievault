

import '@fortawesome/fontawesome-free/css/all.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'react-quill-new/dist/quill.snow.css';


import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
// Import HelmetProvider
import { HelmetProvider } from 'react-helmet-async';
import LoaderWrapper from '@/Components/LoaderWrapper/Index';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    // Use page title as-is when set (e.g. "StoryVault | Save Memories"); otherwise fall back to app name
    title: (title) => (title && title.trim() ? title : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            // Wrap the entire App with HelmetProvider
            <HelmetProvider>
                {/* Add Helmet component here for CDNs */}
               

                {/* Render the app */}
                <LoaderWrapper>
                <App {...props} />
                </LoaderWrapper>
            </HelmetProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
