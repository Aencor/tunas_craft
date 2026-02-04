import React, { useEffect, useRef } from 'react';

const AdBanner = ({ slotId, format = 'auto', className = '', style = {} }) => {
    // Determine if we are in development mode
    const isDev = import.meta.env.DEV;
    
    useEffect(() => {
        try {
            // Push ads ONLY if the script is loaded and we are not in simple dev simulation 
            // (though for testing we might want to see errors if we added the script)
            if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.error('AdSense Error', e);
        }
    }, [slotId]);

    // In DEV, show a placeholder
    if (isDev) {
         return (
            <div className={`bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-center my-6 ${className}`} style={style}>
                 <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Publicidad (Modo Dev)</span>
                 <div className="w-full h-24 bg-slate-700/30 flex items-center justify-center text-slate-500 text-sm">
                     Google AdSense: {slotId || 'No Slot ID'}
                 </div>
            </div>
        );
    }

    // In PROD, show the actual ad unit
    return (
        <div className={`text-center my-6 ${className}`} style={{ minHeight: '100px', ...style }}>
             <span className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1">Publicidad</span>
             <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-3965448004898187"
                 data-ad-slot={slotId}
                 data-ad-format={format}
                 data-full-width-responsive="true"></ins>
        </div>
    );
};

export default AdBanner;
