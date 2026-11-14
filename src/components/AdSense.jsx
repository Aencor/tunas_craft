import React, { useEffect, useRef } from 'react';

/**
 * Optimized Google AdSense Component
 * - Complies with Google AdSense Publisher Policies (transparent "Publicidad" label).
 * - Prevents Cumulative Layout Shift (CLS) via minimum bounding box (SEO Core Web Vitals).
 * - Avoids throwing TagErrors on placeholder/unconfigured slot IDs.
 */
const AdSense = ({ 
    client = "ca-pub-3965448004898187", 
    slot, 
    format = "auto", 
    responsive = "true", 
    className = "",
    minHeight = 90 
}) => {
    const isDev = import.meta.env.DEV;
    const adRef = useRef(null);
    const isPushed = useRef(false);

    // Check if slot is a valid Google AdSense numeric slot ID (typically 10 digits)
    const isValidSlot = slot && !isNaN(slot) && String(slot).length >= 9 && String(slot) !== "1234567890" && String(slot) !== "0987654321";

    useEffect(() => {
        if (!isDev && !isPushed.current) {
            try {
                if (window.adsbygoogle) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    isPushed.current = true;
                }
            } catch (e) {
                // Ignore silent ad-blocker or script load errors
            }
        }
    }, [isDev, isValidSlot]);

    // In development mode: show friendly visual placeholder
    if (isDev) {
        return (
            <div className={`my-6 mx-auto max-w-4xl px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-center ${className}`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                    Google AdSense (Espacio Publicitario)
                </span>
                <div 
                    className="bg-slate-950/60 rounded-lg flex items-center justify-center text-xs text-slate-400 border border-slate-800/80"
                    style={{ minHeight: `${minHeight}px` }}
                >
                    Cliente: {client} · {isValidSlot ? `Bloque: ${slot}` : 'Auto-Ads / Banner Adaptable'}
                </div>
            </div>
        );
    }

    // In production mode: render compliant responsive ad unit
    return (
        <div 
            ref={adRef} 
            className={`my-6 mx-auto text-center overflow-hidden max-w-4xl px-2 ${className}`}
            style={{ minHeight: `${minHeight + 20}px` }}
        >
            <span className="text-[10px] text-slate-600 uppercase tracking-widest block mb-1 select-none">
                Publicidad
            </span>
            <ins 
                className="adsbygoogle"
                style={{ display: 'block', minHeight: `${minHeight}px` }}
                data-ad-client={client}
                {...(isValidSlot ? { 'data-ad-slot': String(slot) } : {})}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
};

export default AdSense;
