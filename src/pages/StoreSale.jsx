import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ArrowLeft, Plus, Trash2, ShoppingBag, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StoreSale = () => {
    const { addOrder, addClient, clients } = useData();
    const navigate = useNavigate();

    const [clientName, setClientName] = useState('');
    const [clientContact, setClientContact] = useState(''); // Email or Phone
    const [deadline, setDeadline] = useState(''); // New State
    
    // Items state
    const [items, setItems] = useState([{ desc: '', qty: 1, price: '' }]);

    const total = useMemo(() => {
        return items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseFloat(item.qty || 1)), 0);
    }, [items]);

    const handleAddItem = () => {
        setItems([...items, { desc: '', qty: 1, price: '' }]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Find or Create Client
        // Simple logic: if name matches existing, use it? Or always create new "Walk-in"?
        // Let's try to match by name or contact if provided.
        let finalClientId = null;
        const normalizedContact = clientContact.trim().toLowerCase();

        const existingClient = clients.find(c => 
            (c.email && c.email.toLowerCase() === normalizedContact) || 
            (c.phone && c.phone === normalizedContact)
        );

        if (existingClient) {
            finalClientId = existingClient.id;
        } else {
            // New Client (Inline)
            // Await the async action and get the returned object with ID
            const newClient = await addClient({
                name: clientName || 'Cliente Mostrador',
                email: clientContact.includes('@') ? clientContact : '',
                phone: !clientContact.includes('@') ? clientContact : '',
                type: 'normal',
                address: 'En Tienda',
                street: 'En Tienda', colony: '', zip: '', state: ''
            }); // Now sync with new ID
            finalClientId = newClient.id;
        }

        // 2. Create Order
        await addOrder({
            clientId: finalClientId,
            items: items.map(i => ({ ...i, price: parseFloat(i.price).toFixed(2) })),
            total: total.toFixed(2),
            advance: total.toFixed(2), // Fully paid
            deliveryLocation: 'Entregado en Tienda',
            status: 'entregado',
            date: new Date().toLocaleDateString('es-MX'),
            deadline: deadline || new Date().toISOString().split('T')[0] // Default to today if empty
        });

        alert('¡Venta registrada con éxito!');
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                        <ShoppingBag className="text-brand-orange" />
                        Registro de Venta <span className="text-slate-500 font-normal text-xl">| Mostrador</span>
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                    
                    {/* Client Info */}
                    <div className="mb-8">
                        <h2 className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-4 border-b border-brand-blue/20 pb-2">Datos del Cliente</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Nombre Cliente</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-brand-blue focus:outline-none transition-colors"
                                    placeholder="Ej. Juan Pérez"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Contacto (Email / Tel)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-brand-blue focus:outline-none transition-colors"
                                    placeholder="Opcional"
                                    value={clientContact}
                                    onChange={e => setClientContact(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                            <h2 className="text-xs font-bold text-brand-orange uppercase tracking-wider">Productos</h2>
                            <button type="button" onClick={handleAddItem} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-full flex items-center gap-1 transition-colors">
                                <Plus size={14} /> Agregar Producto
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-start animate-fade-in-up">
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            placeholder="Descripción del producto..." 
                                            required
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-brand-orange focus:outline-none transition-colors"
                                            value={item.desc}
                                            onChange={e => handleItemChange(index, 'desc', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-20">
                                        <input 
                                            type="number" 
                                            placeholder="Cant." 
                                            required min="1"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-center focus:border-brand-orange focus:outline-none transition-colors"
                                            value={item.qty}
                                            onChange={e => handleItemChange(index, 'qty', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-32 relative">
                                        <span className="absolute left-3 top-3 text-slate-500">$</span>
                                        <input 
                                            type="number" 
                                            placeholder="0.00" 
                                            required step="0.50"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-6 text-sm text-right focus:border-brand-orange focus:outline-none transition-colors"
                                            value={item.price}
                                            onChange={e => handleItemChange(index, 'price', e.target.value)}
                                        />
                                    </div>
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveItem(index)} className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Total */}
                    <div className="bg-slate-900 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle size={16} />
                            <span>La venta se registrará como <strong>ENTREGADA</strong> y pagada al 100%.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-400">Entrega:</label>
                            <input 
                                type="date" 
                                className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-brand-blue outline-none"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <span className="block text-xs text-slate-400 uppercase font-bold">Total a Pagar</span>
                                <span className="text-3xl font-display font-bold text-white">${total.toFixed(2)}</span>
                            </div>
                            <button type="submit" className="bg-brand-blue hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                                <CheckCircle size={24} /> Registrar Venta
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default StoreSale;
