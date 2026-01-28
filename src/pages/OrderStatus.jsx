import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderStatus = () => {
    const { clients, orders } = useData();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        setError('');
        setResults(null); 

        const term = query.trim().toLowerCase();
        if (!term) return;

        // Strategy 1: Match Order ID directly
        // Support partial match for ID or full match? Usually specific status check needs ID.
        // Let's assume strict ID match or at least "ends with" for easier use?
        // User asked: "pone id del pedido o correo... y le arroje los pedidos"
        
        let foundOrders = [];



        // Check 1: Match Order ID directly (Exact or EndsWith for short IDs)
        // We compare strings. unique ID is usually long timestamp. 
        // Admin shows slice(-4). so we should match if id.endsWith(term).
        const orderById = orders.find(o => o.id.toString() === term || o.id.toString().endsWith(term));
        if (orderById) {
            foundOrders.push(orderById);
        } else {
            // Check 2: Match Client (ID, Email, or Phone) -> Get All Orders
            const client = clients.find(c => 
                c.id === term || // Match Client ID directly
                (c.email && c.email.toLowerCase() === term) ||
                (c.phone && c.phone.replace(/\D/g, '') === term.replace(/\D/g, ''))
            );

            if (client) {
                // Ensure strict string comparison for IDs to avoid mismatch
                foundOrders = orders.filter(o => String(o.clientId) === String(client.id));
            }
        }

        if (foundOrders.length > 0) {
            // Sort by date desc (assuming higher ID is newer or date field)
             setResults(foundOrders.reverse());
        } else {
            setError('No se encontraron pedidos con esa información.');
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark text-slate-100 font-sans flex flex-col items-center p-6 md:justify-center">
             <div className="w-full max-w-2xl mb-8 flex justify-start">
                <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2">&larr; Volver</Link>
             </div>

             <div className="w-full max-w-2xl">
                <h1 className="text-3xl font-display font-bold text-center mb-2">Revisa estatus de tu <span className="text-brand-orange">Pedido</span></h1>
                <p className="text-center text-gray-400 mb-8">Ingresa tu ID de pedido, correo o teléfono.</p>

                <div className="glass p-6 md:p-8 rounded-2xl shadow-xl border border-white/10 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <input 
                            type="text" 
                            required
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            placeholder="ID, Correo o Teléfono..."
                        />
                        <button type="submit" className="bg-brand-blue hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 w-full md:w-auto">
                           <Search size={18} /> Buscar
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center flex items-center justify-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                </div>

                {/* Results List */}
                {results && results.length > 0 && (
                    <div className="space-y-6">
                        {results.map(order => (
                             <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-float">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-bold text-xl text-white">Pedido #{order.id.slice(-4)}</h3>
                                        <p className="text-xs text-gray-500">{order.id}</p>
                                        <p className="text-gray-400 text-sm">Fecha: {order.date}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                        ${order.status === 'entregado' ? 'bg-green-500/20 text-green-400' : 
                                          order.status === 'terminado' ? 'bg-blue-500/20 text-blue-400' : 
                                          'bg-brand-orange/20 text-brand-orange'}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {/* Items Breakdown */}
                                    <div className="bg-slate-900/50 rounded-lg p-3">
                                        <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase">Productos</h4>
                                        {order.items && order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm text-slate-200 mb-1 border-b border-slate-700/50 pb-1 last:border-0 last:pb-0">
                                                <span>{item.qty}x {item.desc}</span>
                                                {item.price && <span className="text-gray-500">${item.price} c/u</span>}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3 text-slate-300">
                                        {order.status === 'entregado' ? (
                                            <>
                                                <CheckCircle className="text-green-400" />
                                                <span className="text-green-400 font-bold">¡Entregado!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="text-brand-orange" />
                                                <span>Entrega estimada: {order.deadline || 'Pendiente'}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Progress Image */}
                                    {order.progressImage && (
                                        <div className="mt-4">
                                             <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase">Avance del Pedido</h4>
                                             <img src={order.progressImage} alt="Avance" className="w-full rounded-lg border border-slate-600 shadow-lg" />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-900 rounded-xl p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Total</span>
                                        <span className="text-white font-bold">${order.total}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Pagado (Anticipo)</span>
                                        <span className="text-green-400 font-bold">-${order.advance || 0}</span>
                                    </div>
                                    <div className="border-t border-slate-700 my-2"></div>
                                    <div className="flex justify-between">
                                        <span className="text-brand-orange font-bold">Por Pagar</span>
                                        <span className="text-brand-orange font-bold text-xl">${order.remaining || order.total}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        </div>
    );
};

export default OrderStatus;
