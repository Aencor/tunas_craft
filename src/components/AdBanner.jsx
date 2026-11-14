import React from 'react';
import AdSense from './AdSense';

/**
 * AdBanner adapter component for backwards compatibility
 */
const AdBanner = ({ slotId, format = 'auto', className = '', style = {} }) => {
    return (
        <AdSense 
            slot={slotId} 
            format={format} 
            className={className} 
            minHeight={style.minHeight ? parseInt(style.minHeight, 10) : 90} 
        />
    );
};

export default AdBanner;
