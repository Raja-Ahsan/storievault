

import '@fortawesome/fontawesome-free/css/all.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'react-quill-new/dist/quill.snow.css';


import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
// Import HelmetProvider
import { HelmetProvider } from 'react-helmet-async';

const appName = 'Storie Vault';
const leadingBrand = /^(Storie\s*Vault|StoriVault|StoryVault|Story\s*Vault)(\s+Blog)?\s*[|–—-]\s*/i;
const trailingBrand = /\s*[|–—-]\s*(Storie\s*Vault|StoriVault|StoryVault|Story\s*Vault)(\s+Blog)?$/i;

createInertiaApp({
    title: (title) => {
        let pageTitle = (title || '').trim();
        if (!pageTitle) {
            return appName;
        }

        pageTitle = pageTitle.replace(leadingBrand, '').replace(trailingBrand, '').trim();

        return pageTitle ? `${appName} | ${pageTitle}` : appName;
    },
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
               

                <App {...props} />
            </HelmetProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
