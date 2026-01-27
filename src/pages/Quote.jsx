import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Quote = () => {
    const { addLead } = useData();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '',
        quantity: 1, details: '',
        refType: 'link', refLink: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleRadio = (e) => {
        setFormData(prev => ({ ...prev, refType: e.target.value }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        // Save to DataContext
        const newItem = addLead(formData);

        // WhatsApp Logic
        let message = `🧾 *Nueva Solicitud de Cotización*\n\n`;
        message += `👤 *Nombre:* ${formData.name}\n`;
        message += `📧 *Correo:* ${formData.email}\n`;
        if(formData.phone) message += `📞 *Teléfono:* ${formData.phone}\n`;
        message += `🔢 *Piezas:* ${formData.quantity}\n`;
        
        if (formData.refType === 'link' && formData.refLink) {
            message += `🔗 *Referencia:* ${formData.refLink}\n`;
        } else {
            message += `🖼 *Referencia:* (Envío imagen a continuación)\n`;
        }
        
        if(formData.details) message += `📝 *Detalles:* ${formData.details}\n`;
        
        // Safety check if newItem exists (it should with context update)
        if(newItem && newItem.id) {
             message += `\nID: ${newItem.id}`;
        }

        const phone = '525619956812';
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        
        setShowSuccess(true);
        setIsSubmitting(false);
        setFormData({
            name: '', email: '', phone: '',
            quantity: 1, details: '',
            refType: 'link', refLink: ''
        });
    };

    return (
        <div className="bg-brand-dark min-h-screen text-slate-100 font-sans py-20 px-4 relative overflow-hidden">
             {/* Background Blobs */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-2xl mx-auto">
                <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="mr-2" size={20} /> Volver al Inicio
                </Link>

                <div className="glass p-8 md:p-10 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="font-display text-4xl font-bold mb-4">Cotiza tu <span className="text-brand-blue">Proyecto</span></h1>
                        <p className="text-gray-400">Cuéntanos tu idea para imprimirla en 3D.</p>
                    </div>

                    {showSuccess && (
                        <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-xl mb-6 text-center animate-fade-in">
                            <p className="font-bold">¡Cotización creada con éxito!</p>
                            <p className="text-sm">Te hemos redirigido a WhatsApp para continuar.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
                            <input type="text" id="name" required value={formData.name} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
                                <input type="email" id="email" required value={formData.email} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono / WhatsApp</label>
                                <input type="tel" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Número de piezas</label>
                            <input type="number" id="quantity" min="1" required value={formData.quantity} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">¿Tienes una referencia?</label>
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="ref-type" value="link" checked={formData.refType === 'link'} onChange={handleRadio} className="text-brand-blue" />
                                    <span>Enlace (Link)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="ref-type" value="image" checked={formData.refType === 'image'} onChange={handleRadio} className="text-brand-blue" />
                                    <span>Imagen</span>
                                </label>
                            </div>

                            {formData.refType === 'link' ? (
                                <input type="url" id="refLink" value={formData.refLink} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all" placeholder="https://..." />
                            ) : (
                                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center text-gray-400">
                                    <Upload className="mx-auto mb-2" />
                                    <span className="text-sm">La imagen se enviará en el chat de WhatsApp</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Detalles Adicionales</label>
                            <textarea id="details" rows="3" value={formData.details} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.01] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Procesando...' : 'Continuar en WhatsApp'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Quote;
