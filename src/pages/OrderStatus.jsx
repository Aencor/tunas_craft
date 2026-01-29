import React, { useState } from 'react';
// import { useData } from '../context/DataContext'; // Removed dependency
import { db } from '../firebase';
import { collection, query as queryFirestore, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Search, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderStatus = () => {
    // Remove global data dependency for public search
    // const { clients, orders } = useData(); 
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setResults(null); 
        setLoading(true);

        // Keep original case for ID search (Firestore IDs are case-sensitive)
        const termOriginal = query.trim().replace(/^#/, '');
        const termLower = termOriginal.toLowerCase();
        
        if (!termOriginal) {
             setLoading(false);
             return;
        }

        try {
            let foundOrders = [];

            // Strategy:
            // 1. Try to find by Client (Email/Phone) using lowercase/normalized term
            // 2. Try to find by Order ID using original term (Exact Match)
            
            const clientsRef = collection(db, 'clients');
            const ordersRef = collection(db, 'orders');

            // 1. Client Search (Email / Phone)
            // Note: Phone usually stored as string. We assume normalized in DB or simple match.
            const qEmail = queryFirestore(clientsRef, where('email', '==', termLower)); 
            const qPhone = queryFirestore(clientsRef, where('phone', '==', termOriginal)); // Phone might strictly match input?
            // Fallback for phone: try simple formats if needed, but let's stick to input.

            const [emailSnap, phoneSnap] = await Promise.all([
                 getDocs(qEmail),
                 getDocs(qPhone)
            ]);

            let clientIds = new Set();
            emailSnap.forEach(doc => clientIds.add(doc.id));
            phoneSnap.forEach(doc => clientIds.add(doc.id));

            if (clientIds.size > 0) {
                const idsArray = Array.from(clientIds);
                // Chunking would be needed if > 10, assuming small batch for now
                const qClientOrders = queryFirestore(ordersRef, where('clientId', 'in', idsArray));
                const ordersSnap = await getDocs(qClientOrders);
                ordersSnap.forEach(doc => {
                    foundOrders.push({ id: doc.id, ...doc.data() });
                });
            }

            // 2. Direct Order ID Search
            // Only perform if we haven't found anything or to allow direct ID lookup explicitly
            // We use termOriginal because Firestore IDs are mixed case.
            if (foundOrders.length === 0) {
                 // 2a. Try Full ID
                 const docRef = doc(db, 'orders', termOriginal);
                 const docSnap = await getDoc(docRef);
                 
                 if (docSnap.exists()) {
                     foundOrders.push({ id: docSnap.id, ...docSnap.data() });
                 } else {
                     // 2b. Try Short ID (last 4 chars)
                     // Now that we have a 'shortId' field, we can query it.
                     const qShort = queryFirestore(ordersRef, where('shortId', '==', termOriginal));
                     const shortSnap = await getDocs(qShort);
                     shortSnap.forEach(doc => {
                         foundOrders.push({ id: doc.id, ...doc.data() });
                     });
                 }
            }

            if (foundOrders.length > 0) {
                 // Sort by date?
                 setResults(foundOrders.reverse());
            } else {
                setError('No se encontraron pedidos. Verifica ID (completo o últimos 4), Correo o Teléfono. Si tu pedido es antiguo, contacta a soporte.');
            }

        } catch (err) {
            console.error("Search error:", err);
            setError("Error al buscar. Verifica tu conexión o intenta nuevamente.");
        } finally {
            setLoading(false);
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
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-brand-blue hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {loading ? <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span> : <Search size={18} />} 
                           {loading ? 'Buscando...' : 'Buscar'}
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
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase">Productos</h4>
                                            {/* Progress Bar */}
                                            {order.items && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-green-500 transition-all duration-500"
                                                            style={{ width: `${(order.items.filter(i => i.completed).length / order.items.length) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">
                                                        {order.items.filter(i => i.completed).length}/{order.items.length}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {order.items && order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm text-slate-200 mb-1 border-b border-slate-700/50 pb-1 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${item.completed ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                        {item.completed && <CheckCircle size={10} className="text-white" />}
                                                    </div>
                                                    <span className={item.completed ? 'text-gray-500 line-through' : ''}>
                                                        {item.qty}x {item.desc}
                                                    </span>
                                                </div>
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
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="text-brand-orange" size={16} />
                                                    <span>Entrega estimada: {order.deadline || 'Pendiente'}</span>
                                                </div>
                                                {order.deliveryLocation && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-400 ml-6">
                                                        <span>📍 Zona/Dirección: {order.deliveryLocation}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Image */}
                                    {order.progressImage && (
                                        <div className="mt-4">
                                             <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase">Avance del Pedido</h4>
                                             <img src={order.progressImage} alt="Avance" className="w-full rounded-lg border border-slate-600 shadow-lg" />
                                        </div>
                                    )}

                                    {/* External Evidence Link */}
                                    {order.evidenceLink && (
                                        <div className="mt-4">
                                            <a 
                                                href={order.evidenceLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full block bg-slate-800 hover:bg-slate-700 border border-slate-600 text-center py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-brand-blue font-bold"
                                            >
                                                <Package size={18} /> Ver Fotos / Evidencia (Drive)
                                            </a>
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
