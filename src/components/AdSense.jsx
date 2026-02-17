import React, { useEffect } from 'react';

const AdSense = ({ client = "ca-pub-3965448004898187", slot }) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
           (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense Error:", e);
    }
  }, []);

  useEffect(() => {
      // Dynamically load script if not present
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
          const script = document.createElement('script');
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
          script.async = true;
          script.crossOrigin = "anonymous";
          document.head.appendChild(script);
      }
  }, [client]);

  return (
    <div className="my-8 mx-auto text-center overflow-hidden" style={{ minHeight: '100px' }}>
        <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
        <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">
            Publicidad
        </div>
    </div>
  );
};

export default AdSense;
