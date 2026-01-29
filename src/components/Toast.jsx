import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: 'bg-slate-800 border-green-500 text-green-400',
        error: 'bg-slate-800 border-red-500 text-red-400',
        warning: 'bg-slate-800 border-brand-orange text-brand-orange',
        info: 'bg-slate-800 border-blue-500 text-blue-400',
    };

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertTriangle size={20} />,
        info: <Info size={20} />,
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-black/50 animate-fade-in-up ${styles[type] || styles.info} min-w-[300px]`}>
            {icons[type]}
            <p className="flex-1 font-medium text-sm text-slate-200">{message}</p>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
