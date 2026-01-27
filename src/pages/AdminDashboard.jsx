import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import SalesChart from '../components/SalesChart';
import { Download, Upload, Trash, Trash2, CheckCircle, Package, FileText, ArrowLeft, Users, Plus, DollarSign, Eye, Edit, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { clients, orders, leads, addClient, updateClient, addOrder, updateOrderStatus, updateOrder, deleteOrder, addLead, updateLeadStatus, importDatabase } = useData();
    // We need a helper to update order with more fields (like image), reusing addOrder or creating new one?
    // DataContext doesn't have updateOrderGeneric. Let's add it or use a trick.
    // Actually, updateOrderStatus only updates status. We need to update the image.
    // Let's modify DataContext to allow generic updates or add a specific action. 
    // Since I can't easily modify DataContext in this single step without editing it first, 
    // I'll assume I'll add `updateOrderImage` to DataContext in the next step.
    // For now, let's just assume `updateOrderStatus` can be refactored or we add `updateOrder`.
    
    // Better approach: I will edit DataContext FIRST to add `updateOrder` generic. 
    // BUT, to save steps, I will use `updateOrderStatus` if I can, OR I'll just write the Admin change assuming the context functions exist, 
    // and then update the context.
    
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Modals
    const [approvalModal, setApprovalModal] = useState(null);
    const [newOrderModal, setNewOrderModal] = useState(false);
    const [newClientModal, setNewClientModal] = useState(false);
    const [newLeadModal, setNewLeadModal] = useState(false);
    const [isManualLead, setIsManualLead] = useState(true);

    const [uploadImageModal, setUploadImageModal] = useState(null); // { orderId }
    const [detailsModal, setDetailsModal] = useState(null); // { type: 'order' | 'quote', data: object }
    const [editClientModal, setEditClientModal] = useState(null); // { client }
    
    // New Order State
    const [orderItems, setOrderItems] = useState([{ desc: '', qty: 1, price: 0 }]);
    const [orderTotal, setOrderTotal] = useState(0);
    const [editingOrderId, setEditingOrderId] = useState(null);

    // Calculate total whenever items change
    useMemo(() => {
        const total = orderItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseFloat(item.qty || 1)), 0);
        setOrderTotal(total);
    }, [orderItems]);

    const addOrderItem = () => setOrderItems([...orderItems, { desc: '', qty: 1, price: 0 }]);
    const removeOrderItem = (index) => setOrderItems(orderItems.filter((_, i) => i !== index));
    const updateOrderItem = (index, field, value) => {
        const newItems = [...orderItems];
        newItems[index][field] = value;
        setOrderItems(newItems);
    };
    
    // Filters
    const [leadFilter, setLeadFilter] = useState({ status: 'all', clientId: '' });
    const [leadsPage, setLeadsPage] = useState(0);
    const LEADS_PER_PAGE = 30;

    // Order Filters
    const [orderFilter, setOrderFilter] = useState({ status: 'all', search: '' });
    
    // Derived State for Orders
    const filteredOrders = orders.filter(order => {
        const search = orderFilter.search.toLowerCase();
        // Resolve client data for search
        const client = clients.find(c => c.id === order.clientId);
        const clientName = client ? client.name.toLowerCase() : (order.client || '').toLowerCase();
        const clientEmail = client ? client.email.toLowerCase() : '';
        
        const matchesSearch = 
            search === '' ||
            order.id.toLowerCase().includes(search) ||
            clientName.includes(search) ||
            clientEmail.includes(search);
            
        const matchesStatus = orderFilter.status === 'all' || order.status === orderFilter.status;
        
        return matchesSearch && matchesStatus;
    });

    // --- LOGIC ---

    const handleImport = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try { 
                importDatabase(JSON.parse(event.target.result)); 
                alert('Base de datos importada.');
            } catch(err) { alert('Error JSON'); }
        };
        reader.readAsText(file);
    };



    const handleCreateClient = (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const street = data.get('street');
        const colony = data.get('colony');
        const zip = data.get('zip');
        const state = data.get('state');
        const fullAddress = `${street}, Col. ${colony}, ${zip}, ${state}`;

        addClient({
            name: data.get('name'),
            type: data.get('type'), 
            email: data.get('email'),
            phone: data.get('phone'),
            facebook: data.get('facebook'),
            instagram: data.get('instagram'),
            address: fullAddress,
            street, colony, zip, state
        });
        setNewClientModal(false);
    };

    const handleUpdateClient = (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        
        const street = data.get('street');
        const colony = data.get('colony');
        const zip = data.get('zip');
        const state = data.get('state');
        const fullAddress = `${street}, Col. ${colony}, ${zip}, ${state}`;

        updateClient(editClientModal.id, {
            name: data.get('name'),
            email: data.get('email'),
            phone: data.get('phone'),
            facebook: data.get('facebook'),
            instagram: data.get('instagram'),
            type: data.get('type'),
            address: fullAddress,
            street, colony, zip, state
        });
        setEditClientModal(null);
    };

    const handleCreateLead = (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const clientIdRaw = data.get('clientId');
        
        let clientName = data.get('manualName');
        let clientEmail = data.get('manualEmail');
        let clientPhone = data.get('manualPhone');

        // If existing client selected
        if (clientIdRaw && clientIdRaw !== 'manual') {
            const client = clients.find(c => c.id === clientIdRaw);
            if (client) {
                clientName = client.name;
                clientEmail = client.email;
                clientPhone = client.phone;
            }
        }

        const newLeadData = {
            clientId: clientIdRaw !== 'manual' ? clientIdRaw : null,
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            details: data.get('details'),
            quantity: data.get('quantity'),
            // status: 'Nuevo' // handled in context
        };

        try {
            addLead(newLeadData);
            setNewLeadModal(false);
            alert('Cotización creada correctamente');
        } catch (error) {
            console.error('Error adding lead:', error);
            alert('Error al crear la cotización');
        }
    };

    const handleApproveLead = (e) => {
         e.preventDefault();
         // const { leadId, price, pieces, deadline } = approvalModal; // old destructuring
         // New logic uses the form data from the extended modal
         const formData = new FormData(e.target);
         const leadId = approvalModal.leadId;
         
         const name = formData.get('name');
         const email = formData.get('email');
         const phone = formData.get('phone');
         
         const street = formData.get('street');
         const colony = formData.get('colony');
         const zip = formData.get('zip');
         const state = formData.get('state');
         const fullAddress = `${street}, Col. ${colony}, ${zip}, ${state}`;

         const itemDesc = formData.get('itemDesc');
         const itemQty = parseFloat(formData.get('itemQty'));
         const itemPrice = parseFloat(formData.get('itemPrice'));
         const total = parseFloat(formData.get('total'));
         const deadline = formData.get('deadline');
         const advance = parseFloat(formData.get('advance') || 0);

         // 1. Find or Create Client
         let finalClientId = null;
         
         // Try to find existing by email or phone
         const existingClient = clients.find(c => 
             (email && c.email === email) || 
             (phone && c.phone === phone)
         );

         if (existingClient) {
             finalClientId = existingClient.id;
             // Fix: Update existing client with new details if they changed in the modal
             updateClient(existingClient.id, {
                 name, email, phone,
                 type: existingClient.type,
                 address: fullAddress,
                 street, colony, zip, state
             });
         } else {
             // Create new client
             const newClient = addClient({
                 name, email, phone, 
                 type: 'normal',
                 address: fullAddress,
                 street, colony, zip, state
             });
             finalClientId = newClient.id;
         }

         // 2. Create Order linked to Client
         addOrder({
             clientId: finalClientId,
             items: [{ desc: itemDesc, qty: itemQty, price: itemPrice.toFixed(2) }],
             total: total.toFixed(2),
             advance: advance.toFixed(2),
             deliveryLocation: fullAddress, // Default delivery to client address
             status: 'pedido',
             date: new Date().toLocaleDateString('es-MX'),
             deadline
         });
         
         updateLeadStatus(leadId, 'Aceptada');
         setApprovalModal(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const options = {
            maxSizeMB: 1, // Increased from 0.5
            maxWidthOrHeight: 1920, // Increased
            useWebWorker: true,
            fileType: 'image/webp'
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.onload = (event) => {
                if(window.updateOrderContext) window.updateOrderContext(uploadImageModal.orderId, { progressImage: event.target.result });
                setUploadImageModal(null);
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error('Compression failed, trying raw upload for small files...', error);
            // Fallback: If file < 2MB, verify it as is
            if(file.size < 2 * 1024 * 1024) {
                 const reader = new FileReader();
                 reader.onload = (event) => {
                     if(window.updateOrderContext) window.updateOrderContext(uploadImageModal.orderId, { progressImage: event.target.result });
                     setUploadImageModal(null);
                 };
                 reader.readAsDataURL(file);
            } else {
                 alert('Error: La imagen es muy grande y no se pudo comprimir. Intenta con una más pequeña.');
            }
        }
    };

    // Generic Create/Update Order
    const handleCreateOrder = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const clientIdRaw = formData.get('clientId');
        let finalClientId = clientIdRaw;

        // If editing, we might not need to re-create inline client (usually input is disabled or pre-filled)
        // But if user switched to "New Client" during edit? Let's assume standard flow.


        // Inline Client Creation
        if (clientIdRaw === 'new') {
            const name = formData.get('newClientName');
            const contact = formData.get('newClientContact'); // Email or Phone helper
            const type = 'normal'; // Default new inline clients to normal
            
            const street = formData.get('newClientStreet');
            const colony = formData.get('newClientColony');
            const utf8Zip = formData.get('newClientZip');
            const state = formData.get('newClientState');
            const phone = formData.get('newClientPhone');

            const fullAddress = `${street}, Col. ${colony}, ${utf8Zip}, ${state}`;

            const newClient = addClient({ 
                name, 
                email: contact, // Keeping email as contact for legacy, but we have phone now
                phone,
                type, 
                address: fullAddress,
                street, colony, zip: utf8Zip, state
            }); 
            finalClientId = newClient.id;
        }
        
        // Validations
        const advance = parseFloat(formData.get('advance') || 0);
        if (advance > orderTotal) {
            alert('El anticipo no puede ser mayor al total del pedido.');
            return;
        }

        // Common Data
        const orderData = {
            clientId: finalClientId,
            items: orderItems.map(item => ({ ...item, price: parseFloat(item.price).toFixed(2) })),
            total: orderTotal.toFixed(2),
            advance: advance.toFixed(2),
            deliveryLocation: formData.get('delivery'),
            status: 'pedido', // Default, logic in context preserves or overwrites
            date: new Date().toLocaleDateString('es-MX')
        };

        if (editingOrderId) {
            // Update Existing
            updateOrder(editingOrderId, {
                ...orderData,
                status: orders.find(o => o.id === editingOrderId)?.status // Preserve status
            });
            alert('Pedido actualizado');
        } else {
            // Create New
            addOrder(orderData);
        }
        
        setNewOrderModal(false);
        setEditingOrderId(null);
        setOrderItems([{ desc: '', qty: 1, price: 0 }]); // Reset
    };

    const handleEditOrder = (order) => {
        setEditingOrderId(order.id);
        setOrderItems(order.items || []);
        
        // Wait for modal to open to set form values? No, we can just open it.
        // We'll need to set defaultValue of inputs or control them.
        // Current form uses uncontrolled for some, controlled for items.
        // We need to set the initial values of the form fields when the modal opens.
        // Simplest way: Set a state 'editFormData' and use key to reset form or defaultValues.
        // BUT, since we use `newOrderModal` which is a boolean, we can't easily pass data.
        // Let's rely on `useEffect` inside the modal or just use DOM manipulation (ugly) or state.
        // Better: Make the form controlled or use a key on the form to force re-render with defaults.
        // Actually, let's just use `editingOrderId` to derive defaults in the JSX.
        setNewOrderModal(true);
    };

    const handleDeleteOrder = (id) => {
        if(confirm('¿Estás seguro de eliminar este pedido?')) {
            deleteOrder(id);
        }
    };

    // Derived State for Dashboard
    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const totalPaid = orders.reduce((sum, o) => sum + parseFloat(o.advance || 0), 0);
    const totalReceivable = orders.reduce((sum, o) => sum + parseFloat(o.remaining || (o.total - (o.advance||0)) || 0), 0);
    const activeQuotes = leads.filter(l => l.status === 'Nuevo' || l.status === 'Pendiente').length;
    const rejectedQuotes = leads.filter(l => l.status === 'Rechazada').length;

    // Derived State for Leads
    const filteredLeads = leads.filter(l => {
        if (leadFilter.status !== 'all' && l.status !== leadFilter.status) return false;
        if (leadFilter.clientId && !l.id.includes(leadFilter.clientId)) return false;
        return true;
    });
    const paginatedLeads = filteredLeads.slice(leadsPage * LEADS_PER_PAGE, (leadsPage + 1) * LEADS_PER_PAGE);

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
             
             {/* Sidebar */}
             <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col p-6">
                <h1 className="font-display font-bold text-2xl text-white mb-8">Tuna's <span className="text-brand-orange">Admin</span></h1>
                <nav className="space-y-2 flex-1">
                    <NavBtn id="dashboard" icon={<Package />} label="Dashboard" active={activeTab} set={setActiveTab} />
                    <NavBtn id="orders" icon={<CheckCircle />} label="Pedidos" active={activeTab} set={setActiveTab} />
                    <NavBtn id="leads" icon={<FileText />} label="Cotizaciones" active={activeTab} set={setActiveTab} />
                    <NavBtn id="clients" icon={<Users />} label="Clientes" active={activeTab} set={setActiveTab} />
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-700">
                    <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white mb-4">
                        <ArrowLeft size={16} /> Ir al Sitio
                    </Link>
                    <label className="w-full bg-slate-700 hover:bg-slate-600 p-2 rounded text-center items-center justify-center flex cursor-pointer gap-2">
                        <Upload size={16} /> Importar DB
                        <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                </div>
             </aside>

             {/* Main Content */}
             <main className="flex-1 overflow-y-auto p-8 relative">
                 
                 {/* Dashboard */}
                 {activeTab === 'dashboard' && (
                     <div className="space-y-6">
                         <h2 className="text-3xl font-display font-bold">Resumen</h2>
                         
                         {/* KPIs */}
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                             <StatCard title="Ventas Totales" value={`$${totalSales.toFixed(2)}`} icon={<DollarSign className="text-brand-blue" />} />
                             <StatCard title="Cobrado" value={`$${totalPaid.toFixed(2)}`} color="text-green-500" />
                             <StatCard title="Por Cobrar" value={`$${totalReceivable.toFixed(2)}`} color="text-brand-orange" />
                             <StatCard title="Pedidos Activos" value={orders.filter(o => o.status !== 'entregado').length} />
                             <StatCard title="Cotizaciones Activas" value={activeQuotes} color="text-blue-400" />
                             <StatCard title="Cot. Rechazadas" value={rejectedQuotes} color="text-red-400" />
                         </div>

                         {/* Chart */}
                         <SalesChart orders={orders} />
                     </div>
                 )}

                 {/* Orders */}
                 {activeTab === 'orders' && (
                     <div>
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-display font-bold">Pedidos</h2>
                                                         <div className="flex gap-3">
                                <Link to="/venta-tienda" className="bg-brand-orange hover:bg-orange-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                    <ShoppingBag size={18} /> Venta Mostrador
                                </Link>
                                <div className="relative">
                                    <input 
                                        placeholder="Buscar (ID, Cliente, Correo)..." 
                                        className="bg-slate-800 border border-slate-600 rounded-lg pl-3 pr-10 py-2 w-64 text-sm focus:outline-none focus:border-brand-blue"
                                        value={orderFilter.search}
                                        onChange={(e) => setOrderFilter({...orderFilter, search: e.target.value})}
                                    />
                                    {orderFilter.search && (
                                        <button onClick={() => setOrderFilter({...orderFilter, search: ''})} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">✕</button>
                                    )}
                                </div>
                                <select 
                                    className="bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-blue"
                                    value={orderFilter.status}
                                    onChange={(e) => setOrderFilter({...orderFilter, status: e.target.value})}
                                >
                                    <option value="all">Todos los Estatus</option>
                                    <option value="pedido">Pedido</option>
                                    <option value="proceso">En Proceso</option>
                                    <option value="terminado">Terminado</option>
                                    <option value="entregado">Entregado</option>
                                </select>
                                <button onClick={() => setNewOrderModal(true)} className="bg-brand-blue hover:bg-blue-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                                    <Plus size={18} /> Nuevo Pedido
                                </button>
                             </div>
                         </div>
                         <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                            <table className="w-full text-left">
                                <thead className="bg-slate-700/50 text-slate-300">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Entrega</th>
                                        <th className="p-4">Restante</th>
                                        <th className="p-4">Estatus</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {filteredOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-700/30">
                                            <td className="p-4 text-xs text-slate-500">#{order.id.slice(-4)}</td>
                                            <td className="p-4 font-medium">
                                                {order.client || clients.find(c => c.id === order.clientId)?.name || 'Unknown'}
                                                <div className="text-xs text-slate-500 max-w-[150px] truncate">{order.deliveryLocation || 'Sin ubicación'}</div>
                                            </td>
                                            <td className="p-4 text-sm font-bold text-center">{order.items ? order.items.length : 1}</td>
                                            <td className="p-4 text-brand-orange font-bold">${order.remaining}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2">
                                                    <select 
                                                        value={order.status} 
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className="bg-slate-900 border border-slate-600 rounded text-xs p-1 w-full"
                                                    >
                                                        <option value="pedido">Pedido</option>
                                                        <option value="proceso">En Proceso</option>
                                                        <option value="terminado">Terminado</option>
                                                        <option value="entregado">Entregado</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold">${order.total}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button 
                                                        onClick={() => setDetailsModal({type:'order', data: order})}
                                                        className="p-2 text-brand-orange hover:bg-brand-orange/20 rounded-full transition-colors"
                                                        title="Ver Detalles"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditOrder(order)}
                                                        className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-full transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setUploadImageModal({ orderId: order.id })}
                                                        className="p-2 text-purple-400 hover:bg-purple-400/20 rounded-full transition-colors"
                                                        title="Subir Foto"
                                                    >
                                                        <Upload size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                     </div>
                 )}

                 {/* Clients */}
                 {activeTab === 'clients' && (
                     <div>
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-display font-bold">Clientes</h2>
                            <button onClick={() => setNewClientModal(true)} className="bg-brand-blue hover:bg-blue-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                                <Plus size={18} /> Nuevo Cliente
                            </button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             {clients.map(client => (
                                 <div key={client.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                     <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{client.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded uppercase font-bold 
                                            ${client.type === 'distribuidor' ? 'bg-purple-500/20 text-purple-400' : 
                                              client.type === 'mayorista' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600/20 text-slate-400'}`}>
                                            {client.type}
                                        </span>
                                     </div>
                                     <p className="text-sm text-slate-400 mt-1">ID: {client.id ? client.id.slice(-6) : 'N/A'}</p>
                                     <p className="text-sm text-slate-400">{client.email}</p>
                                     <p className="text-sm text-slate-400">{client.phone}</p>
                                     {(client.facebook || client.instagram) && (
                                         <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                             {client.facebook && <span>FB: {client.facebook}</span>}
                                             {client.instagram && <span>IG: {client.instagram}</span>}
                                         </div>
                                     )}
                                     <p className="text-xs text-slate-500 mt-2 truncate"><span className='font-bold'>Dirección:</span> {client.address || 'Sin dirección'}</p>
                                     
                                     <button onClick={() => setEditClientModal(client)} className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold flex justify-center items-center gap-2">
                                         <Edit size={14} /> Editar
                                     </button>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {/* Leads */}
                 {activeTab === 'leads' && (
                     <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-display font-bold">Cotizaciones</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setNewLeadModal(true)} className="bg-brand-blue hover:bg-blue-600 px-3 py-2 rounded-lg font-bold flex items-center gap-2 text-sm">
                                    <Plus size={16} /> Nueva
                                </button>
                                <select className="bg-slate-800 border border-slate-600 rounded p-2 text-sm" onChange={e => setLeadFilter({...leadFilter, status: e.target.value})}>
                                    <option value="all">Ver Todos</option>
                                    <option value="Nuevo">Nuevos</option>
                                    <option value="Aceptada">Aceptadas</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-4">
                            {paginatedLeads.map(lead => (
                                <div key={lead.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold">{lead.name}</h3>
                                        <p className="text-sm text-slate-400">{lead.details}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${lead.status === 'Aceptada' ? 'bg-green-500/20 text-green-400' : 'bg-brand-orange/20 text-brand-orange'}`}>
                                            {lead.status}
                                        </span>
                                        {lead.status !== 'Aceptada' && (
                                            <button 
                                                onClick={() => setApprovalModal({ 
                                                    leadId: lead.id, 
                                                    name: lead.name, 
                                                    email: lead.email,
                                                    phone: lead.phone,
                                                    itemDesc: lead.details,
                                                    itemQty: lead.quantity || 1,
                                                    price: 0, 
                                                    deadline: '' 
                                                })}
                                                className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-2 rounded"
                                            >
                                                Aprobar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Pagination */}
                        <div className="flex justify-center mt-6 gap-2">
                            <button disabled={leadsPage === 0} onClick={() => setLeadsPage(p => p - 1)} className="px-3 py-1 bg-slate-800 rounded disabled:opacity-50">Anterior</button>
                            <span className="px-3 py-1">Pág {leadsPage + 1}</span>
                            <button disabled={paginatedLeads.length < LEADS_PER_PAGE} onClick={() => setLeadsPage(p => p + 1)} className="px-3 py-1 bg-slate-800 rounded disabled:opacity-50">Siguiente</button>
                        </div>
                     </div>
                 )}
             </main>

            {/* MODALS */}
            
            {/* New Order Modal (Multi-Item) */}
            {newOrderModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateOrder} className="bg-slate-800 p-6 rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{editingOrderId ? 'Editar Pedido' : 'Nuevo Pedido'}</h3>
                        
                        <div className="space-y-4">
                            {/* Client Section */}
                            <div className="bg-black/20 p-4 rounded-xl">
                                <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Cliente</label>
                                <select 
                                    name="clientId" 
                                    defaultValue={editingOrderId ? orders.find(o => o.id === editingOrderId)?.clientId : ""}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 mb-2"
                                    onChange={(e) => {
                                        if(e.target.value === 'new') {
                                            document.getElementById('newClientFields').style.display = 'block';
                                        } else {
                                            document.getElementById('newClientFields').style.display = 'none';
                                            // Auto-fill delivery location from client address if possible
                                            const client = clients.find(c => c.id === e.target.value);
                                            if(client && client.address) {
                                                document.getElementById('deliveryInput').value = client.address;
                                            }
                                        }
                                    }}
                                >
                                    <option value="">-- Seleccionar Cliente --</option>
                                    <option value="new">+ Crear Nuevo Cliente</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                                </select>

                                {/* Inline New Client Fields */}
                                <div id="newClientFields" style={{display: 'none'}} className="space-y-2 mt-2 border-t border-slate-600 pt-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="newClientName" placeholder="Nombre Completo" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                        <input name="newClientContact" placeholder="Email" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                    </div>
                                    <input name="newClientPhone" placeholder="Teléfono" className="w-full bg-slate-900 border border-slate-600 rounded p-2" />
                                    <h4 className="text-xs text-gray-400 font-bold uppercase mt-1">Dirección</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="newClientStreet" placeholder="Calle y Número" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                        <input name="newClientColony" placeholder="Colonia" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="newClientZip" placeholder="C.P." className="bg-slate-900 border border-slate-600 rounded p-2" />
                                        <input name="newClientState" placeholder="Estado" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Items Section */}
                            <div className="bg-black/20 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs text-slate-400 font-bold uppercase">Productos</label>
                                    <button type="button" onClick={addOrderItem} className="text-xs text-brand-blue hover:underline flex items-center gap-1"><Plus size={12}/> Agregar</button>
                                </div>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                    {orderItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input 
                                                placeholder="Descripción" 
                                                value={item.desc}
                                                onChange={e => updateOrderItem(idx, 'desc', e.target.value)}
                                                className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm" 
                                                required 
                                            />
                                            <input 
                                                type="number" 
                                                placeholder="Cant" 
                                                value={item.qty}
                                                onChange={e => updateOrderItem(idx, 'qty', e.target.value)}
                                                className="w-16 bg-slate-900 border border-slate-600 rounded p-2 text-sm" 
                                                required 
                                                min="1"
                                            />
                                            <input 
                                                type="number" 
                                                placeholder="$ Unit" 
                                                value={item.price}
                                                onChange={e => updateOrderItem(idx, 'price', e.target.value)}
                                                className="w-24 bg-slate-900 border border-slate-600 rounded p-2 text-sm" 
                                                required 
                                            />
                                            {orderItems.length > 1 && (
                                                <button type="button" onClick={() => removeOrderItem(idx)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Totales</label>
                                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-600">
                                        <div className="flex justify-between mb-1 text-sm">
                                            <span>Subtotal:</span>
                                            <span className="font-bold">${orderTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                             <span className="text-xs text-gray-400">Anticipo:</span>
                                             <input name="advance" type="number" defaultValue="0" className="w-24 bg-black/50 border border-slate-700 rounded p-1 text-right text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Entrega</label>
                                    <textarea id="deliveryInput" name="delivery" placeholder="Dirección de entrega..." className="w-full h-full bg-slate-900 border border-slate-600 rounded p-2 text-sm resize-none" required></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-700 pt-4">
                            <button type="button" onClick={() => setNewOrderModal(false)} className="text-slate-400">Cancelar</button>
                            <button type="submit" className="bg-brand-blue px-6 py-2 rounded font-bold hover:bg-blue-600">
                                {editingOrderId ? 'Actualizar Pedido' : 'Crear Pedido'} (${orderTotal.toFixed(2)})
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* New Client Modal */}
            {newClientModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateClient} className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">Nuevo Cliente</h3>
                        <div className="space-y-3">
                            <input name="name" placeholder="Nombre Completo" className="w-full bg-slate-900 border border-slate-600 rounded p-2" required />
                            <input name="email" placeholder="Correo" className="w-full bg-slate-900 border border-slate-600 rounded p-2" />
                            <input name="phone" placeholder="Teléfono" className="w-full bg-slate-900 border border-slate-600 rounded p-2" />
                            <div className="grid grid-cols-2 gap-2">
                                <input name="facebook" placeholder="Facebook" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                <input name="instagram" placeholder="Instagram" className="bg-slate-900 border border-slate-600 rounded p-2" />
                            </div>
                            
                            <h4 className="text-xs text-gray-400 font-bold uppercase mt-2">Dirección</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <input name="street" placeholder="Calle y Número" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                <input name="colony" placeholder="Colonia" className="bg-slate-900 border border-slate-600 rounded p-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input name="zip" placeholder="C.P." className="bg-slate-900 border border-slate-600 rounded p-2" />
                                <input name="state" placeholder="Estado" className="bg-slate-900 border border-slate-600 rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-xs mb-1 text-slate-400">Tipo de Cliente</label>
                                <select name="type" className="w-full bg-slate-900 border border-slate-600 rounded p-2">
                                    <option value="normal">Normal</option>
                                    <option value="mayorista">Mayorista (10% Desc)</option>
                                    <option value="distribuidor">Distribuidor (25% Desc)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setNewClientModal(false)} className="text-slate-400">Cancelar</button>
                            <button type="submit" className="bg-brand-blue px-4 py-2 rounded font-bold">Guardar</button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Approval Modal (Extended) */}
            {approvalModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                     <form onSubmit={handleApproveLead} className="bg-slate-800 p-6 rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Aprobar Cotización & Crear Pedido</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Client Info */}
                            <div className="space-y-3">
                                <h4 className="text-xs text-brand-blue font-bold uppercase border-b border-brand-blue/30 pb-1">Datos del Cliente</h4>
                                
                                <input name="name" defaultValue={approvalModal.name} placeholder="Nombre Completo" className="w-full bg-slate-900 border border-slate-600 rounded p-2" required />
                                <input name="email" defaultValue={approvalModal.email} placeholder="Correo" className="w-full bg-slate-900 border border-slate-600 rounded p-2" />
                                <input name="phone" defaultValue={approvalModal.phone} placeholder="Teléfono" className="w-full bg-slate-900 border border-slate-600 rounded p-2" required />
                                
                                <div className="bg-black/20 p-2 rounded">
                                    <label className="text-xs text-gray-500 block mb-1">Dirección (Opcional)</label>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <input name="street" placeholder="Calle y Núm" className="bg-slate-900 border border-slate-600 rounded p-2 text-sm" />
                                        <input name="colony" placeholder="Colonia" className="bg-slate-900 border border-slate-600 rounded p-2 text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="zip" placeholder="C.P." className="bg-slate-900 border border-slate-600 rounded p-2 text-sm" />
                                        <input name="state" placeholder="Estado" className="bg-slate-900 border border-slate-600 rounded p-2 text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Order Info */}
                            <div className="space-y-3">
                                <h4 className="text-xs text-brand-orange font-bold uppercase border-b border-brand-orange/30 pb-1">Datos del Pedido</h4>
                                
                                <div>
                                    <label className="text-xs text-gray-400">Producto / Descripción</label>
                                    <textarea name="itemDesc" defaultValue={approvalModal.itemDesc} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm h-20 resize-none" required></textarea>
                                </div>
                                
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-400">Cantidad</label>
                                        <input name="itemQty" type="number" defaultValue={approvalModal.itemQty} className="w-full bg-slate-900 border border-slate-600 rounded p-2" required />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-400">Precio Unit.</label>
                                        <input name="itemPrice" type="number" step="0.01" placeholder="$0.00" 
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-2" 
                                            onChange={(e) => {
                                                const price = parseFloat(e.target.value) || 0;
                                                const qty = parseFloat(document.querySelector('input[name="itemQty"]').value) || 1;
                                                document.getElementById('approvalTotal').value = (price * qty).toFixed(2);
                                            }}
                                            required 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">Total del Pedido</label>
                                    <input id="approvalTotal" name="total" readOnly className="w-full bg-black/40 border border-slate-600 rounded p-2 font-bold text-white" />
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-400">Anticipo</label>
                                        <input name="advance" type="number" defaultValue="0" className="w-full bg-slate-900 border border-slate-600 rounded p-2" />
                                    </div>
                                    <div className="flex-1">
                                         <label className="text-xs text-gray-400">Fecha Entrega</label>
                                         <input name="deadline" type="date" className="w-full bg-slate-900 border border-slate-600 rounded p-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-700 pt-4">
                            <button type="button" onClick={() => setApprovalModal(null)} className="text-slate-400 hover:text-white">Cancelar</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold">Generar Pedido</button>
                        </div>
                     </form>
                </div>
            )}

            {/* Upload Image Modal */}
            {uploadImageModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700 text-center">
                        <h3 className="text-xl font-bold mb-4">Evidencia del Pedido</h3>
                        <p className="text-gray-400 text-sm mb-4">Sube una foto de cómo va el pedido o cómo quedó (Max 1MB).</p>
                        
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-brand-blue file:text-white
                            hover:file:bg-blue-600 mb-6" 
                        />

                        <button onClick={() => setUploadImageModal(null)} className="text-slate-400 text-sm">Cancelar</button>
                    </div>
                </div>
            )}

            {/* Details Modal (Order / Quote) */}
            {detailsModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setDetailsModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><Trash2 size={20} className="rotate-45" /></button>
                        
                        <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                             {detailsModal.type === 'order' ? <Package className="text-brand-blue" /> : <Tag className="text-brand-orange" />}
                             Detalle de {detailsModal.type === 'order' ? 'Pedido' : 'Cotización'}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {/* Col 1: Data */}
                             <div className="space-y-4">
                                 <div>
                                     <h4 className="text-xs uppercase text-gray-500 font-bold mb-1">Cliente</h4>
                                     <p className="text-white text-lg font-bold">
                                         {detailsModal.type === 'order' 
                                            ? clients.find(c => c.id === detailsModal.data.clientId)?.name 
                                            : detailsModal.data.name}
                                     </p>
                                     <p className="text-sm text-gray-400">
                                         {detailsModal.type === 'order' 
                                            ? clients.find(c => c.id === detailsModal.data.clientId)?.email 
                                            : detailsModal.data.email}
                                     </p>
                                 </div>
                                 
                                 {detailsModal.data.items && detailsModal.data.items.length > 0 && (
                                     <div>
                                         <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Desglose de Artículos</h4>
                                         <div className="bg-black/30 rounded-lg p-3 space-y-2">
                                             {detailsModal.data.items.map((it, i) => (
                                                 <div key={i} className="flex justify-between text-sm">
                                                     <span className="text-slate-200">{it.qty}x {it.desc}</span>
                                                     {it.price && <span className="text-slate-500">${it.price}</span>}
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}

                                 {!detailsModal.data.items && (
                                     <div>
                                         <h4 className="text-xs uppercase text-gray-500 font-bold mb-1">Descripción</h4>
                                         <p className="text-slate-300">{detailsModal.data.desc || detailsModal.data.details}</p>
                                         <p className="text-slate-300 text-sm mt-1">Cantidad: {detailsModal.data.quantity || 1}</p>
                                     </div>
                                 )}

                                 {detailsModal.type === 'order' && (
                                     <div className="bg-brand-blue/10 p-4 rounded-xl border border-brand-blue/30">
                                         <div className="flex justify-between mb-1">
                                             <span className="text-gray-400">Total</span>
                                             <span className="text-white font-bold">${detailsModal.data.total}</span>
                                         </div>
                                         <div className="flex justify-between mb-1">
                                             <span className="text-gray-400">Anticipo</span>
                                             <span className="text-green-400 font-bold">-${detailsModal.data.advance}</span>
                                         </div>
                                         <div className="border-t border-white/10 pt-2 flex justify-between">
                                             <span className="text-brand-orange font-bold">Restante</span>
                                             <span className="text-brand-orange font-bold text-xl">${detailsModal.data.remaining}</span>
                                         </div>
                                     </div>
                                 )}
                             </div>

                             {/* Col 2: Images */}
                             <div className="space-y-4">
                                 {detailsModal.data.progressImage && (
                                     <div>
                                         <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Evidencia / Progreso</h4>
                                         <img src={detailsModal.data.progressImage} className="w-full rounded-xl border border-slate-600" />
                                     </div>
                                 )}
                                 
                                 {/* Reference Image from Quote */}
                                 {detailsModal.data.refType === 'link' && detailsModal.data.refLink && (
                                     <div>
                                         <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Referencia</h4>
                                         <a href={detailsModal.data.refLink} target="_blank" className="text-brand-blue underline break-all text-sm">{detailsModal.data.refLink}</a>
                                     </div>
                                 )}
                             </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                            <button onClick={() => setDetailsModal(null)} className="px-6 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Client Modal */}
             {editClientModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleUpdateClient} className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">Editar Cliente</h3>
                        <div className="space-y-3">
                            <div className="bg-black/20 p-3 rounded border border-slate-700">
                                <label className="text-xs text-gray-500 uppercase font-bold">Nombre</label>
                                <input name="name" defaultValue={editClientModal.name} className="w-full bg-slate-900 border border-slate-600 rounded p-2" required />
                            </div>
                            <div className="bg-black/20 p-3 rounded border border-slate-700">
                                <label className="text-xs text-gray-500 uppercase font-bold">Contacto</label>
                                <input name="email" defaultValue={editClientModal.email} placeholder="Correo" className="w-full bg-slate-900 border border-slate-600 rounded p-2 mb-2" />
                                <input name="phone" defaultValue={editClientModal.phone} placeholder="Teléfono" className="w-full bg-slate-900 border border-slate-600 rounded p-2" />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input name="facebook" defaultValue={editClientModal.facebook} placeholder="Facebook" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                    <input name="instagram" defaultValue={editClientModal.instagram} placeholder="Instagram" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                </div>
                            </div>
                            <div className="bg-black/20 p-3 rounded border border-slate-700">
                                <label className="text-xs text-gray-500 uppercase font-bold">Dirección</label>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <input name="street" defaultValue={editClientModal.street} placeholder="Calle y Número" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                    <input name="colony" defaultValue={editClientModal.colony} placeholder="Colonia" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input name="zip" defaultValue={editClientModal.zip} placeholder="C.P." className="bg-slate-900 border border-slate-600 rounded p-2" />
                                    <input name="state" defaultValue={editClientModal.state} placeholder="Estado" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs mb-1 text-slate-400">Tipo de Cliente</label>
                                <select name="type" defaultValue={editClientModal.type} className="w-full bg-slate-900 border border-slate-600 rounded p-2">
                                    <option value="normal">Normal</option>
                                    <option value="mayorista">Mayorista (10% Desc)</option>
                                    <option value="distribuidor">Distribuidor (25% Desc)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setEditClientModal(null)} className="text-slate-400">Cancelar</button>
                            <button type="submit" className="bg-brand-blue px-4 py-2 rounded font-bold">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            )}



            {/* New Lead Modal */}
            {newLeadModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateLead} className="bg-slate-800 p-6 rounded-2xl w-full max-w-lg border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">Nueva Cotización</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Cliente</label>
                                <select 
                                    name="clientId" 
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 mb-2"
                                    onChange={(e) => setIsManualLead(e.target.value === 'manual')}
                                >
                                    <option value="manual">-- Cliente Manual / Nuevo --</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                
                                {isManualLead && (
                                    <div className="space-y-2 border-t border-slate-600 pt-2">
                                        <input name="manualName" placeholder="Nombre Cliente" className="w-full bg-slate-900 border border-slate-600 rounded p-2" required />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input name="manualEmail" placeholder="Correo" className="bg-slate-900 border border-slate-600 rounded p-2" />
                                            <input name="manualPhone" placeholder="Teléfono" className="bg-slate-900 border border-slate-600 rounded p-2" required />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Detalles</label>
                                <textarea name="details" placeholder="Describe lo que el cliente quiere cotizar..." className="w-full bg-slate-900 border border-slate-600 rounded p-2 h-24 resize-none" required></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Cantidad</label>
                                <input name="quantity" type="number" defaultValue="1" className="w-24 bg-slate-900 border border-slate-600 rounded p-2" required />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-700 pt-4">
                            <button type="button" onClick={() => setNewLeadModal(false)} className="text-slate-400">Cancelar</button>
                            <button type="submit" className="bg-brand-blue px-6 py-2 rounded font-bold hover:bg-blue-600">Crear Cotización</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const NavBtn = ({ id, icon, label, active, set }) => (
    <button onClick={() => set(id)} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${active === id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
        {icon} <span>{label}</span>
    </button>
);

const StatCard = ({ title, value, icon, color = 'text-white' }) => (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 text-xs font-bold uppercase">{title}</h3>
            {icon}
        </div>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

export default AdminDashboard;
