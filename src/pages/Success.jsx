import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

const Success = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state;

    useEffect(() => {
        // If someone navigates to /success directly without state, send them back to the catalog
        if (!orderData) {
            navigate('/catalogo');
        }
    }, [orderData, navigate]);

    if (!orderData) return null;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 md:p-12 rounded-2xl border border-slate-700 shadow-2xl max-w-lg w-full text-center animate-fade-in-up">
                
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-500 w-12 h-12" />
                </div>
                
                <h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-yellow-500 mb-2">
                    ¡Gracias, {orderData.clientName}!
                </h1>
                <p className="text-slate-300 text-lg mb-8">
                    Tu pedido ha sido registrado exitosamente.
                </p>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 text-left space-y-3">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4 border-b border-slate-700 pb-2">Resumen de tu pedido</h3>
                    
                    {orderData.orderId && orderData.orderId !== 'WhatsApp' && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Folio de Pedido:</span>
                            <span className="font-mono text-brand-blue bg-blue-500/10 px-2 py-1 rounded">#{orderData.orderId}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Artículos solicitados:</span>
                        <span className="font-bold">{orderData.itemCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-slate-700 mt-2">
                        <span className="font-bold text-slate-300">Total a Pagar:</span>
                        <span className="font-display text-xl font-bold text-brand-orange">${orderData.total}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-slate-400 mb-6 italic">
                        Si por alguna razón no se abrió la ventana de WhatsApp, no te preocupes. Hemos guardado tu pedido y nos pondremos en contacto contigo pronto.
                    </p>
                    
                    <Link to="/catalogo" className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                        <ShoppingBag size={18} />
                        Seguir Explorando
                    </Link>
                </div>
                
            </div>
        </div>
    );
};

export default Success;
