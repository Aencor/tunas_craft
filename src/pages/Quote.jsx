import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ArrowLeft, Upload, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';


const Quote = () => {
    const { addLead } = useData();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '',
        quantity: 1, details: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Save to DataContext (Lead)
            const newItem = addLead({
                ...formData,
                imageUrl: null
            });

            // WhatsApp Logic
            let message = `*Nueva Solicitud de Cotización - Tuna's Craft*\n\n`;
            message += `*Nombre:* ${formData.name}\n`;
            message += `*Correo:* ${formData.email}\n`;
            if(formData.phone) message += `*Teléfono:* ${formData.phone}\n`;
            message += `*Piezas:* ${formData.quantity}\n`;
            
            if(formData.details) message += `*Detalles:* ${formData.details}\n`;
            
            if(newItem && newItem.id) {
                 message += `\nID: ${newItem.id}`;
            }

            const phone = '525544744531';
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
            
            setShowSuccess(true);
            setFormData({
                name: '', email: '', phone: '',
                quantity: 1, details: '',
            });

        } catch (error) {
            console.error("Error submitting quote:", error);
            const msg = error.code ? `${error.code}: ${error.message}` : error.message;
            alert(`Error al enviar: ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 font-sans py-16 px-4">
            <div className="max-w-2xl mx-auto">
                <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors text-sm font-medium">
                    <ArrowLeft className="mr-2" size={18} /> Volver al Inicio
                </Link>

                <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">Cotización Directa</span>
                        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-3">
                            Cotiza tu <span className="text-amber-400">Proyecto 3D</span>
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Cuéntanos las medidas, detalles o envíanos tu modelo para cotizarte rápidamente.
                        </p>
                    </div>

                    {showSuccess && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl mb-6 text-center animate-fade-in">
                            <p className="font-bold">¡Cotización registrada con éxito!</p>
                            <p className="text-xs mt-1">Te hemos redirigido a WhatsApp para coordinar los detalles.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Nombre Completo</label>
                            <input type="text" id="name" required value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors" placeholder="Tu nombre" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Correo Electrónico</label>
                                <input type="email" id="email" required value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors" placeholder="correo@ejemplo.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Teléfono / WhatsApp</label>
                                <input type="tel" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors" placeholder="55 1234 5678" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Número de piezas</label>
                            <input type="number" id="quantity" min="1" required value={formData.quantity} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detalles Adicionales</label>
                            <textarea id="details" rows="3" value={formData.details} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors" placeholder="Dimensiones aproximadas, color, uso o enlace de referencia..."></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Procesando...' : 'Enviar y Continuar en WhatsApp'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Quote;
