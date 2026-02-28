import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Inicializar MercadoPago con llave pública (Reemplazar con llave real)
initMercadoPago('APP_USR-00000000-0000-0000-0000-000000000000', { locale: 'es-MX' });

const Checkout = () => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    
    // Payment Method State
    const [paymentMethod, setPaymentMethod] = useState('whatsapp'); // 'whatsapp', 'mercadopago', 'paypal'

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [discountInfo, setDiscountInfo] = useState(null);
    const [couponError, setCouponError] = useState('');

    const handleApplyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) return;
        
        try {
            const q = query(collection(db, 'coupons'), where('code', '==', code));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const couponDoc = querySnapshot.docs[0].data();
                setDiscountInfo({ code, ...couponDoc });
                setCouponError('');
            } else {
                setDiscountInfo(null);
                setCouponError('Cupón inválido o expirado.');
            }
        } catch (error) {
            console.error("Error validating coupon:", error);
            setCouponError('Error al validar cupón.');
        }
    };

    const removeCoupon = () => {
        setDiscountInfo(null);
        setCouponCode('');
        setCouponError('');
    };

    // Google Drive URL parser for thumbnails and logo fallback
    const getGoogleDriveImage = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') return '/logo.png';
        const driveRegex = /(?:\/d\/|id=)([a-zA-Z0-9_-]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
        }
        return url;
    };

    // Calculate Totals
    let discountAmount = 0;
    if (discountInfo) {
        if (discountInfo.type === 'percent') {
            discountAmount = cartTotal * (discountInfo.value / 100);
        } else if (discountInfo.type === 'fixed') {
            discountAmount = discountInfo.value;
        }
    }
    const finalTotal = Math.max(0, cartTotal - discountAmount);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const orderTotal = finalTotal.toFixed(2);
        const orderItems = cartItems.map(item => ({
            desc: item.name,
            qty: item.quantity,
            price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : item.price
        }));

        let orderId = 'WhatsApp';

        try {
            // Attempt to find existing client by phone
            const clientsRef = collection(db, 'clients');
            const phoneQuery = query(clientsRef, where('phone', '==', formData.phone));
            const phoneSnapshot = await getDocs(phoneQuery);
            
            let clientId;
            if (!phoneSnapshot.empty) {
                clientId = phoneSnapshot.docs[0].id;
            } else {
                // If no phone match and email is provided, could check email too, but phone is safer unique key
                const emailQuery = formData.email ? query(clientsRef, where('email', '==', formData.email)) : null;
                let emailSnapshot = null;
                if (emailQuery) {
                    emailSnapshot = await getDocs(emailQuery);
                }
                
                if (emailSnapshot && !emailSnapshot.empty) {
                    clientId = emailSnapshot.docs[0].id;
                } else {
                    // Create new client
                    const newClient = {
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email,
                        type: 'normal',
                        address: 'Checkout Online',
                        joinedAt: new Date().toISOString()
                    };
                    const clientRef = await addDoc(clientsRef, newClient);
                    clientId = clientRef.id;
                }
            }

            // Attempt to save order
            const newOrder = {
                clientId: clientId,
                items: orderItems,
                total: orderTotal,
                advance: "0.00",
                remaining: orderTotal,
                deliveryLocation: 'Pendiente - Tienda Online',
                status: 'pedido en línea',
                date: new Date().toLocaleDateString('es-MX'),
                notes: formData.notes
            };
            
            const orderRef = await addDoc(collection(db, 'orders'), newOrder);
            const shortId = orderRef.id.slice(-4);
            await updateDoc(orderRef, { shortId });
            orderId = shortId;
        } catch (error) {
            console.error("Error al guardar pedido en Firebase. Es posible que falten permisos públicos:", error);
            // We ignore the error and still generate the WhatsApp link so the customer can finish the order
        }

        // Generate WhatsApp Link
        const phoneNumber = "525534476672"; // Updated WhatsApp number for online orders
        
        let message = `¡Hola! Quiero realizar un pedido en línea.%0A%0A`;
        if (orderId !== 'WhatsApp') {
            message += `*No. Pedido:* ${orderId}%0A`;
        }
        message += `*Cliente:* ${formData.name}%0A`;
        message += `*Teléfono:* ${formData.phone}%0A`;
        if (formData.email) message += `*Email:* ${formData.email}%0A`;
        message += `%0A*Productos:*%0A`;
        
        cartItems.forEach(item => {
            message += `- ${item.quantity}x ${item.name} ($${item.price})%0A`;
        });
        
        message += `%0A*Subtotal:* $${cartTotal.toFixed(2)}%0A`;
        if (discountInfo) {
            message += `*Cupón (${discountInfo.code}):* -$${discountAmount.toFixed(2)}%0A`;
        }
        message += `*Total a Pagar:* $${orderTotal}%0A`;

        if (formData.notes) {
            message += `%0A*Notas:* ${formData.notes}%0A`;
        }
        
        message += `%0A¡Gracias! Quedo a la espera de confirmación.`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        // Clear cart and redirect
        clearCart();
        window.open(whatsappUrl, '_blank');
        
        // Redirect to success page with data for the confirmation message
        navigate('/success', {
            state: {
                clientName: formData.name,
                orderId: orderId,
                total: orderTotal,
                itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0)
            }
        });
        
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
            <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/catalogo" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Finalizar Pedido
                    </h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg mb-6">Tu carrito está vacío.</p>
                        <Link to="/catalogo" className="bg-brand-orange hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all">
                            Volver al Catálogo
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                                 <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                                     Productos seleccionados
                                 </h2>
                                 <div className="space-y-4">
                                     {cartItems.map((item) => (
                                         <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-white/5 last:border-0 last:pb-0 gap-4">
                                             <div className="flex items-center gap-4">
                                                 {item.image && typeof item.image === 'string' && item.image.trim() !== '' ? (
                                                     <img src={getGoogleDriveImage(item.image)} alt={item.name} className={`w-16 h-16 rounded-lg object-cover bg-slate-700 hidden sm:block ${getGoogleDriveImage(item.image) === '/logo.png' ? 'p-2' : ''}`} />
                                                 ) : (
                                                     <img src="/logo.png" alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-slate-700 hidden sm:block p-2" />
                                                 )}
                                                 <div>
                                                    <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                                    <p className="text-brand-orange font-bold text-sm">{item.price}</p>
                                                 </div>
                                             </div>
                                             <div className="flex items-center gap-4 self-end sm:self-auto">
                                                 <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-600">
                                                     <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:text-brand-orange transition-colors"
                                                     >
                                                         <Minus size={16} />
                                                     </button>
                                                     <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                                     <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:text-brand-orange transition-colors"
                                                     >
                                                         <Plus size={16} />
                                                     </button>
                                                 </div>
                                                 <button 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                 >
                                                     <Trash2 size={20} />
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                        </div>

                        {/* Summary & Form */}
                        <div className="space-y-6">
                            <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl sticky top-4">
                                <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Resumen de Compra</h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center text-sm text-gray-400">
                                        <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} artículos)</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Cupón */}
                                    <div className="pt-2 pb-2 border-y border-white/5">
                                        {!discountInfo ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Código de cupón" 
                                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-brand-blue outline-none uppercase"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={handleApplyCoupon}
                                                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                                    >
                                                        Aplicar
                                                    </button>
                                                </div>
                                                {couponError && <p className="text-red-400 text-xs">{couponError}</p>}
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center text-sm text-green-400 bg-green-400/10 p-2 rounded-lg border border-green-400/20">
                                                <span>Cupón: {discountInfo.code} ({discountInfo.label})</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                                                    <button type="button" onClick={removeCoupon} className="text-red-400 hover:text-red-300" title="Quitar cupón">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mb-2 pt-2">
                                        <span className="font-bold text-lg">Total a Pagar</span>
                                        <div className="text-right">
                                            {discountInfo && (
                                                <span className="text-sm line-through text-gray-500 block">${cartTotal.toFixed(2)}</span>
                                            )}
                                            <span className="text-3xl font-display font-bold text-brand-orange">${finalTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 italic mb-4">* Puedes coordinar el pago y envío directamente por WhatsApp.</p>
                                </div>

                                <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-3 mt-6">Tus Datos</h3>
                                <div className="space-y-4">
                                    <div>
                                        <input 
                                            type="text" 
                                            name="name"
                                            required 
                                            placeholder="Nombre completo *"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-brand-blue focus:outline-none transition-colors"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            required 
                                            placeholder="Teléfono / WhatsApp *"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-brand-blue focus:outline-none transition-colors"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="email" 
                                            name="email"
                                            placeholder="Correo electrónico (Opcional)"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-brand-blue focus:outline-none transition-colors"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <textarea 
                                            name="notes"
                                            placeholder="Notas de entrega o indicaciones adicionales (Opcional)"
                                            rows="2"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-brand-blue focus:outline-none transition-colors resize-none"
                                            value={formData.notes}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-3 mt-6">Método de Pago</h3>
                                <div className="space-y-3 mb-6">
                                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'whatsapp' ? 'bg-brand-orange/10 border-brand-orange' : 'bg-slate-900 border-slate-600 hover:border-slate-400'}`}>
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="whatsapp" 
                                            checked={paymentMethod === 'whatsapp'} 
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-brand-orange bg-slate-800 border-slate-600 focus:ring-brand-orange focus:ring-2"
                                        />
                                        <div className="ml-3 flex flex-col">
                                            <span className="font-bold text-white text-md">Acordar por WhatsApp</span>
                                            <span className="text-sm text-slate-400">Paga posteriormente con transferencia o efectivo.</span>
                                        </div>
                                    </label>

                                    {/* 
                                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'mercadopago' ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-900 border-slate-600 hover:border-slate-400'}`}>
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="mercadopago" 
                                            checked={paymentMethod === 'mercadopago'} 
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-blue-500 bg-slate-800 border-slate-600 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <div className="ml-3 flex flex-col">
                                            <span className="font-bold text-white text-md">Mercado Pago</span>
                                            <span className="text-sm text-slate-400">Tarjetas, efectivo y transferencias (Configuración Pendiente).</span>
                                        </div>
                                    </label>

                                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'bg-[#003087]/20 border-[#0079C1]' : 'bg-slate-900 border-slate-600 hover:border-slate-400'}`}>
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="paypal" 
                                            checked={paymentMethod === 'paypal'} 
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-[#0079C1] bg-slate-800 border-slate-600 focus:ring-[#0079C1] focus:ring-2"
                                        />
                                        <div className="ml-3 flex flex-col">
                                            <span className="font-bold text-white text-md">PayPal</span>
                                            <span className="text-sm text-slate-400">Pago seguro e internacional (Configuración Pendiente).</span>
                                        </div>
                                    </label>
                                    */}
                                </div>

                                {paymentMethod === 'whatsapp' && (
                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="w-full mt-6 bg-brand-orange hover:bg-orange-500 disabled:bg-gray-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-orange/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Send size={20} />
                                        {submitting ? 'Procesando...' : 'Pedir por WhatsApp'}
                                    </button>
                                )}

                                {/*
                                {paymentMethod === 'mercadopago' && (
                                    <div className="mt-6 p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-center">
                                        <p className="text-slate-300 text-sm mb-4">La pasarela de MercadoPago está en modo de prueba. Necesitas configurar la llave pública real y el servidor.</p>
                                        <div className="relative z-0 pointer-events-none opacity-50">
                                            <Wallet initialization={{ preferenceId: 'mock-preference-id' }} customization={{ texts: { valueProp: 'smart_option' } }}/>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'paypal' && (
                                    <div className="mt-6 p-4 rounded-xl border border-[#0079C1]/30 bg-[#003087]/10 text-center relative z-0">
                                        <p className="text-slate-300 text-sm mb-4">La pasarela de PayPal está inhabilitada hasta configurar el Client ID real.</p>
                                        <div className="pointer-events-none opacity-50">
                                            <PayPalScriptProvider options={{ "client-id": "sb", currency: "MXN" }}>
                                                <PayPalButtons style={{ layout: "vertical" }} disabled={true} />
                                            </PayPalScriptProvider>
                                        </div>
                                    </div>
                                )}
                                */}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
