import { useEffect } from 'react';

/**
 * Dynamic SEO Component for Tuna's Craft
 * Updates page title, meta description, canonical URL, OpenGraph tags, and page-specific Schema JSON-LD.
 */
const SEO = ({
    title,
    description,
    canonical,
    type = 'website',
    image = 'https://tunascraft.com/logo.png',
    structuredData = null
}) => {
    useEffect(() => {
        // Update Title
        const baseTitle = "Tuna's Craft";
        const fullTitle = title 
            ? (title.includes(baseTitle) ? title : `${title} | ${baseTitle}`)
            : "Tuna's Craft | Impresión 3D, Modelado y Prototipado en CDMX y México";
        document.title = fullTitle;

        // Helper to update or create a meta tag
        const setMeta = (attr, key, content) => {
            if (!content) return;
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        // Helper to update or create a link tag
        const setLink = (rel, href) => {
            if (!href) return;
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            el.setAttribute('href', href);
        };

        // Description
        const descContent = description || "Estudio profesional de impresión 3D, prototipado y modelado digital en Ciudad de México (CDMX). Cotiza online tus archivos STL/3MF y recibe envíos a todo México.";
        setMeta('name', 'description', descContent);
        setMeta('name', 'title', fullTitle);

        // Canonical URL
        const canonicalUrl = canonical || window.location.href.split('#')[0];
        setLink('canonical', canonicalUrl);

        // OpenGraph
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', descContent);
        setMeta('property', 'og:url', canonicalUrl);
        setMeta('property', 'og:type', type);
        setMeta('property', 'og:image', image);

        // Twitter
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', descContent);
        setMeta('name', 'twitter:image', image);

        // Page-level Structured Data (JSON-LD)
        let scriptTag = document.getElementById('page-seo-schema');
        if (structuredData) {
            if (!scriptTag) {
                scriptTag = document.createElement('script');
                scriptTag.id = 'page-seo-schema';
                scriptTag.type = 'application/ld+json';
                document.head.appendChild(scriptTag);
            }
            scriptTag.text = JSON.stringify(structuredData);
        } else if (scriptTag) {
            scriptTag.remove();
        }

        return () => {
            // Clean up page-specific schema on unmount
            const tag = document.getElementById('page-seo-schema');
            if (tag) tag.remove();
        };
    }, [title, description, canonical, type, image, structuredData]);

    return null;
};

export default SEO;
