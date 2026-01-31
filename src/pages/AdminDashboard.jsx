import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import SalesChart from '../components/SalesChart';
import { Download, Upload, Trash, Trash2, CheckCircle, Package, FileText, ArrowLeft, Users, Plus, DollarSign, Eye, Edit, ShoppingBag, Menu, X, Search, ArrowUpDown, CreditCard, ArrowUp, ArrowDown, Calculator, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PriceCalculator from '../components/PriceCalculator';
// Toast removed per user request

const AdminDashboard = () => {
    const { 
        clients, orders, leads, user, loadingAuth, login, logout, 
        addClient, updateClient, 
        addOrder, updateOrder, updateOrderStatus, deleteOrder,
        addLead, updateLead, deleteLead,
        expenses, addExpense, deleteExpense,
        quotes, deleteQuote, updateQuote
    } = useData();

    // Helper for status colors
    const getStatusColor = (status) => {
        switch(status) {
            case 'pedido': return 'bg-brand-orange/20 text-brand-orange border-brand-orange/30';
            case 'proceso': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'terminado': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'entregado': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-slate-900 border-slate-600 text-slate-300';
        }
    };

    // -- HOOKS MUST BE TOP LEVEL --
    
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Menu State
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for forms
    
    // Modals
    const [approvalModal, setApprovalModal] = useState(null);
    const [newOrderModal, setNewOrderModal] = useState(false);
    const [newClientModal, setNewClientModal] = useState(false);
    const [newLeadModal, setNewLeadModal] = useState(false);
    const [isManualLead, setIsManualLead] = useState(true);

    const [uploadImageModal, setUploadImageModal] = useState(null); // { orderId }
    const [detailsModal, setDetailsModal] = useState(null); // { type: 'order' | 'quote', data: object }
    const [editClientModal, setEditClientModal] = useState(null); // { client }
    const [clientHistoryModal, setClientHistoryModal] = useState(null); // { client }

    
    // New Order State
    const [orderItems, setOrderItems] = useState([{ desc: '', qty: 1, price: 0 }]);
    const [orderTotal, setOrderTotal] = useState(0);
    const [editingOrderId, setEditingOrderId] = useState(null);

    // Calculate total whenever items change
    useMemo(() => {
        const total = orderItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseFloat(item.qty || 1)), 0);
        setOrderTotal(total);
    }, [orderItems]);

    // Filters
    const [leadFilter, setLeadFilter] = useState({ status: 'all', clientId: '' });
    const [clientQuery, setClientQuery] = useState('');
    const [leadsPage, setLeadsPage] = useState(0);
    const LEADS_PER_PAGE = 30;

    // Order Filters
    const [orderFilter, setOrderFilter] = useState({ status: 'all', search: '' });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Sort State
    const [expenseFilter, setExpenseFilter] = useState({ date: '', method: 'all' }); // Expense Filter State
    const [clientSortConfig, setClientSortConfig] = useState({ key: 'name', direction: 'asc' }); // Client Sort State
    
    // Quote Filters
    const [quoteFilter, setQuoteFilter] = useState({ category: 'all', search: '' });
    const [quoteSortConfig, setQuoteSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [quoteToEdit, setQuoteToEdit] = useState(null);
    const [selectedQuoteIds, setSelectedQuoteIds] = useState(new Set());
    const [batchCategory, setBatchCategory] = useState('');
    
    // -- FUNCTIONS --

    const addOrderItem = () => setOrderItems([...orderItems, { desc: '', qty: 1, price: 0 }]);
    const removeOrderItem = (index) => setOrderItems(orderItems.filter((_, i) => i !== index));
    const updateOrderItem = (index, field, value) => {
        const newItems = [...orderItems];
        newItems[index][field] = value;
        setOrderItems(newItems);
    };

    // Derived State for Orders (Safe to compute even if empty)
    const filteredOrders = useMemo(() => {
        let result = orders.filter(order => {
            const search = orderFilter.search.toLowerCase();
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

        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'deadline') {
                    aValue = aValue || '';
                    bValue = bValue || '';
                }

                if (sortConfig.key === 'status') {
                    const statusOrder = { 'pedido': 0, 'proceso': 1, 'terminado': 2, 'entregado': 3 };
                    aValue = statusOrder[aValue] ?? 99;
                    bValue = statusOrder[bValue] ?? 99;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [orders, clients, orderFilter, sortConfig]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const matchesDate = expenseFilter.date === '' || expense.date === expenseFilter.date;
            const matchesMethod = expenseFilter.method === 'all' || expense.method === expenseFilter.method;
            return matchesDate && matchesMethod;
        });
    }, [expenses, expenseFilter]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleClientSort = (key) => {
        let direction = 'asc';
        if (clientSortConfig.key === key && clientSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setClientSortConfig({ key, direction });
    };

    const filteredClients = useMemo(() => {
        let result = clients.map(client => ({
            ...client,
            orderCount: orders.filter(o => o.clientId === client.id).length
        }));

        if (clientQuery) {
            const q = clientQuery.toLowerCase();
            result = result.filter(c => 
                 c.name.toLowerCase().includes(q) || 
                 (c.email && c.email.toLowerCase().includes(q)) ||
                 (c.phone && c.phone.includes(q))
            );
        }

        if (clientSortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[clientSortConfig.key];
                let bValue = b[clientSortConfig.key];

                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();

                if (aValue < bValue) return clientSortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return clientSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [clients, orders, clientQuery, clientSortConfig]);

    const filteredQuotes = useMemo(() => {
        let result = quotes.filter(quote => {
            const search = quoteFilter.search.toLowerCase();
            // Handle array or string
            const categories = Array.isArray(quote.category) ? quote.category : [quote.category];
            const categoriesString = categories.filter(Boolean).join(' ').toLowerCase();

            const matchesSearch = 
                search === '' ||
                quote.name.toLowerCase().includes(search) ||
                categoriesString.includes(search);
            
            const matchesCategory = quoteFilter.category === 'all' || categories.includes(quoteFilter.category);
            
            return matchesSearch && matchesCategory;
        });

        if (quoteSortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[quoteSortConfig.key] || '';
                let bValue = b[quoteSortConfig.key] || '';
                
                if (quoteSortConfig.key === 'date') {
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
                }

                if (aValue < bValue) return quoteSortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return quoteSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [quotes, quoteFilter, quoteSortConfig]);

    const handleQuoteSort = (key) => {
        let direction = 'asc';
        if (quoteSortConfig.key === key && quoteSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setQuoteSortConfig({ key, direction });
    };

    // Unique Categories for Filter
    const uniqueCategories = useMemo(() => {
        const cats = new Set(quotes.flatMap(q => Array.isArray(q.category) ? q.category : [q.category]).filter(Boolean));
        return ['all', ...Array.from(cats)];
    }, [quotes]);
    
    const handleEditQuote = (quote) => {
        setQuoteToEdit(quote);
        setActiveTab('calculator');
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedQuoteIds(new Set(filteredQuotes.map(q => q.id)));
        } else {
            setSelectedQuoteIds(new Set());
        }
    };

    const handleSelectQuote = (id) => {
        const next = new Set(selectedQuoteIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedQuoteIds(next);
    };

    const handleBatchUpdate = async () => {
        if (!batchCategory.trim()) return alert('Ingresa una categoría');
        if (selectedQuoteIds.size === 0) return;

        if (!confirm(`¿Actualizar categoría para ${selectedQuoteIds.size} cotizaciones?`)) return;

        try {
            // Split by comma
            const categoryArray = batchCategory.split(',').map(c => c.trim()).filter(c => c);
            const updates = Array.from(selectedQuoteIds).map(id => updateQuote(id, { category: categoryArray }));
            await Promise.all(updates);
            alert('Categorías actualizadas');
            setSelectedQuoteIds(new Set());
            setBatchCategory('');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar');
        }
    };

    // -- EARLY RETURNS --
    if (loadingAuth) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Cargando...</div>;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-4">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center max-w-md w-full">
                     <h1 className="font-display font-bold text-3xl mb-2">Tuna's <span className="text-brand-orange">Admin</span></h1>
                     <p className="text-slate-400 mb-8">Inicia sesión para gestionar tu negocio.</p>
                     
                     <button 
                        onClick={login}
                        className="w-full bg-white text-gray-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
                     >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                        Acceder con Google
                     </button>
                </div>
            </div>
        );
    }

    // --- LOGIC ---

    const handleImport = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try { 
                importDatabase(JSON.parse(event.target.result)); 
                alert('Base de datos importada.');
            } catch(err) { alert('Error al procesar el archivo JSON'); }
        };
        reader.readAsText(file);
    };

    const handleGenerateShortIds = async () => {
        if(!confirm('¿Generar IDs cortos para todos los pedidos? Esto es necesario para la búsqueda pública.')) return;
        
        let count = 0;
        for (const order of orders) {
            // Update all to ensure consistency
            const shortId = order.id.slice(-4); 
            try {
                await updateOrder(order.id, { shortId });
                count++;
            } catch (err) {
                console.error("Error updating order", order.id, err);
            }
        }
        alert(`Se actualizaron ${count} pedidos con Short ID.`);
    };

    const handleSubmitExpense = (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        addExpense({
            concept: data.get('concept'),
            amount: data.get('amount'),
            date: data.get('date'),
            method: data.get('method')
        });
        e.target.reset();
        alert('Gasto registrado exitosamente');
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

    const handleToggleItem = async (orderId, itemIndex) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.items) return;

        const newItems = [...order.items];
        // Toggle the 'completed' status of the specific item
        // Ensure property exists first
        const currentStatus = newItems[itemIndex].completed || false;
        newItems[itemIndex] = { ...newItems[itemIndex], completed: !currentStatus };

        try {
            await updateOrder(orderId, { items: newItems });
        } catch (error) {
            console.error("Error toggling item:", error);
            alert("Error al actualizar el artículo.");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const options = {
            maxSizeMB: 1, 
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/webp'
        };

        try {
            const compressedFile = await imageCompression(file, options);
            
            // Upload to Firebase Storage
            const fileRef = ref(storage, `orders/${uploadImageModal.orderId}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, compressedFile);
            const downloadURL = await getDownloadURL(fileRef);

            // Update Order in Firestore
            await updateOrder(uploadImageModal.orderId, { progressImage: downloadURL });
            
            setUploadImageModal(null);
            alert('Imagen subida con éxito');

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen.');
        }
    };


    // Generic Create/Update Order
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.target);
            const clientIdRaw = formData.get('clientId');
            let finalClientId = clientIdRaw;
            
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

                const newClient = await addClient({ 
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
                setIsSubmitting(false); // Manually reset as we return early
                return;
            }

            // Common Data
            const orderData = {
                clientId: finalClientId,
                items: orderItems.map(item => ({ ...item, price: parseFloat(item.price).toFixed(2) })),
                total: orderTotal.toFixed(2),
                advance: advance.toFixed(2),
                remaining: (orderTotal - advance).toFixed(2),
                deliveryLocation: formData.get('delivery'),
                status: 'pedido', // Default, logic in context preserves or overwrites
                date: new Date().toLocaleDateString('es-MX'),
                deadline: formData.get('deadline'), // New Field
                evidenceLink: formData.get('evidenceLink') // New Field
            };

            let targetOrderId = editingOrderId;

            if (editingOrderId) {
                // Update Existing
                await updateOrder(editingOrderId, {
                    ...orderData,
                    status: orders.find(o => o.id === editingOrderId)?.status // Preserve status
                });
                alert('Pedido actualizado correctamente');
            } else {
                // Create New
                const newOrder = await addOrder(orderData);
                targetOrderId = newOrder.id;
            }

        // Handle Image Upload from Form
        const imageFile = formData.get('orderImage');
        if (imageFile && imageFile.size > 0) {
            try {
                 const options = {
                    maxSizeMB: 1, 
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    fileType: 'image/webp'
                };
                const compressedFile = await imageCompression(imageFile, options);
                
                // Upload
                const fileRef = ref(storage, `orders/${targetOrderId}/${Date.now()}_${imageFile.name}`);
                await uploadBytes(fileRef, compressedFile);
                const downloadURL = await getDownloadURL(fileRef);

                // Update Order with Image
                await updateOrder(targetOrderId, { progressImage: downloadURL });

            } catch (err) {
                console.error("Error uploading form image:", err);
                alert("El pedido se guardó pero hubo un error subiendo la imagen.");
            }
        }
        
        setNewOrderModal(false);
        setEditingOrderId(null);
        setOrderItems([{ desc: '', qty: 1, price: 0 }]); // Reset

        } catch (error) {
            console.error("Error saving order:", error);
            alert("Error al guardar pedido: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
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

    const handleDeleteClient = (id) => {
        if(confirm('¿Estás seguro de eliminar este cliente?')) {
            deleteClient(id);
        }
    };

    const handleWhatsApp = (order) => {
        const client = clients.find(c => c.id === order.clientId);
        // Fallback to order phone if client not found, or prompt user if missing
        const phone = client?.phone || order.phone; 
        
        if (!phone) {
            alert('Este pedido no tiene un número de teléfono asociado.');
            return;
        }

        // Clean phone number (remove non-digits)
        const cleanPhone = phone.replace(/\D/g, '');
        
        // E.g. https://tunas-craft.com/estatus -> updated to /status as requested
        const statusLink = `${window.location.origin}/status`; 
        
        const itemsList = order.items.map(i => `- ${i.qty}x ${i.desc}`).join('\n');

        const message = `Hola ${client?.name || 'Cliente'}, tu pedido #${order.id.slice(-4)} tiene un estatus de *${order.status}*.

Resumen:
${itemsList}
        
Puedes revisar el avance y detalles aquí: ${statusLink}
        
Saludos, Tuna's Craft 🌵`;

        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // Derived State for Dashboard
    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const totalPaid = orders.reduce((sum, o) => sum + parseFloat(o.advance || 0), 0);
    const totalReceivable = orders.reduce((sum, o) => sum + parseFloat(o.remaining || (o.total - (o.advance||0)) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netProfit = totalSales - totalExpenses;
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
        <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-slate-900 text-slate-100 font-sans md:overflow-hidden relative">
             
             {/* Mobile Sidebar Toggle */}
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="md:hidden absolute top-6 right-6 z-50 p-2 bg-slate-800 rounded-lg text-white shadow-lg border border-slate-700"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
             </button>

             {/* Sidebar Overlay */}
             {isSidebarOpen && (
                 <div 
                    className="fixed inset-0 bg-black/80 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                 ></div>
             )}

             {/* Sidebar */}
             <aside className={`
                fixed md:static top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700 
                flex flex-col p-6 z-40 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
             `}>
                <h1 className="font-display font-bold text-2xl text-white mb-8 ml-8 md:ml-0">Tuna's <span className="text-brand-orange">Admin</span></h1>
                <nav className="space-y-2 flex-1">
                    <NavBtn id="dashboard" icon={<Package />} label="Dashboard" active={activeTab} set={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <NavBtn id="orders" icon={<CheckCircle />} label="Pedidos" active={activeTab} set={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <NavBtn id="leads" icon={<FileText />} label="Cotizaciones" active={activeTab} set={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <NavBtn id="clients" icon={<Users />} label="Clientes" active={activeTab} set={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <NavBtn id="expenses" icon={<CreditCard />} label="Gastos" active={activeTab} set={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <NavBtn id="saved_quotes" icon={<Archive />} label="Historial 3D" active={activeTab} set={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <NavBtn id="calculator" icon={<Calculator />} label="Cotizador 3D" active={activeTab} set={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-700 space-y-2">
                    <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white px-2">
                        <ArrowLeft size={16} /> Ir al Sitio
                    </Link>
                    <label className="w-full bg-slate-700 hover:bg-slate-600 p-2 rounded text-center items-center justify-center flex cursor-pointer gap-2 text-sm">
                        <Upload size={14} /> Importar DB
                        <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                    <button onClick={handleGenerateShortIds} className="w-full bg-slate-700 hover:bg-slate-600 p-2 rounded text-center items-center justify-center flex cursor-pointer gap-2 text-sm text-brand-orange">
                        <Upload size={14} /> Reparar DB (Short IDs)
                    </button>
                    <button onClick={logout} className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-200 p-2 rounded flex items-center justify-center gap-2 text-sm transition-colors">
                        <Trash2 size={14} /> Cerrar Sesión
                    </button>
                </div>
             </aside>

             {/* Main Content */}
             {/* Adjusted padding: reduced md:p-8 to md:px-8 md:py-4 to reduce visual gap between sidebar and content */}
             <main className="flex-1 md:overflow-y-auto px-6 py-4 md:py-8 md:px-8 relative">
                 
                 {/* Dashboard */}
                 {activeTab === 'dashboard' && (
                     <div className="space-y-6">
                         <h2 className="text-3xl font-display font-bold">Resumen</h2>
                         
                         {/* KPIs */}
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                             <StatCard title="Ventas Totales" value={`$${totalSales.toFixed(2)}`} icon={<DollarSign className="text-brand-blue" />} />
                             <StatCard title="Gastos Totales" value={`$${totalExpenses.toFixed(2)}`} color="text-red-400" />
                             <StatCard title="Ganancia Neta" value={`$${netProfit.toFixed(2)}`} color={netProfit >= 0 ? "text-green-400" : "text-red-500"} />
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
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-3xl font-display font-bold">Pedidos</h2>
                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                <Link to="/venta-tienda" className="bg-brand-orange hover:bg-orange-600 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                                    <ShoppingBag size={18} /> Venta Mostrador
                                </Link>
                                <div className="relative w-full md:w-auto">
                                    <input 
                                        placeholder="Buscar (ID, Cliente, Correo)..." 
                                        className="bg-slate-800 border border-slate-600 rounded-lg pl-3 pr-10 py-2 w-full md:w-64 text-sm focus:outline-none focus:border-brand-blue"
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
                                <button onClick={() => setNewOrderModal(true)} className="bg-brand-blue hover:bg-blue-600 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                                    <Plus size={18} /> Nuevo Pedido
                                </button>
                             </div>
                         </div>
                         <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-700/50 text-slate-300">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Lugar</th>
                                        <th className="p-4 text-center">Arts.</th>
                                        <th 
                                            className="p-4 cursor-pointer hover:text-white transition-colors select-none"
                                            onClick={() => handleSort('deadline')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Fecha Entrega
                                                {sortConfig.key === 'deadline' && (
                                                    <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'text-brand-blue' : 'text-brand-orange'} />
                                                )}
                                            </div>
                                        </th>
                                        <th className="p-4">Restante</th>
                                        <th 
                                            className="p-4 cursor-pointer hover:text-white transition-colors select-none"
                                            onClick={() => handleSort('status')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Estatus
                                                {sortConfig.key === 'status' && (
                                                    <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'text-brand-blue' : 'text-brand-orange'} />
                                                )}
                                            </div>
                                        </th>
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
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">
                                                {order.deliveryLocation || 'Sin ubicación'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="font-bold text-sm mb-1">{order.items ? order.items.length : 1}</div>
                                                <div className="flex flex-col gap-1 max-w-[200px] mx-auto">
                                                    {order.items && order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 mb-1">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={item.completed || false} 
                                                                onChange={() => handleToggleItem(order.id, idx)}
                                                                className="cursor-pointer rounded border-slate-600 bg-slate-700 text-brand-blue focus:ring-brand-blue"
                                                                title="Marcar como listo"
                                                            />
                                                            <span className={`text-[10px] leading-tight truncate ${item.completed ? 'text-green-400 line-through decoration-green-400/50' : 'text-slate-400'}`}>
                                                                {item.qty}x {item.desc}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">{order.deadline || 'Pendiente'}</td>
                                            <td className="p-4 text-brand-orange font-bold">${order.remaining}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2">
                                                    <select 
                                                        value={order.status} 
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className={`border rounded text-xs p-2 w-full font-bold ${getStatusColor(order.status)}`}
                                                    >
                                                        <option value="pedido" className="bg-slate-900 text-slate-300">Pedido</option>
                                                        <option value="proceso" className="bg-slate-900 text-slate-300">En Proceso</option>
                                                        <option value="terminado" className="bg-slate-900 text-slate-300">Terminado</option>
                                                        <option value="entregado" className="bg-slate-900 text-slate-300">Entregado</option>
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
                                                        onClick={() => handleWhatsApp(order)}
                                                        className="p-2 text-green-400 hover:bg-green-400/20 rounded-full transition-colors"
                                                        title="Enviar WhatsApp"
                                                    >
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-4 h-4" alt="WA" />
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
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-3xl font-display font-bold">Clientes</h2>
                            <div className="flex w-full md:w-auto gap-2">
                               <div className="relative flex-1 md:w-64">
                                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                                   <input 
                                       type="text" 
                                       placeholder="Buscar cliente..." 
                                       value={clientQuery}
                                       onChange={(e) => setClientQuery(e.target.value)}
                                       className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-blue"
                                   />
                               </div>
                               <button onClick={() => setNewClientModal(true)} className="bg-brand-blue hover:bg-blue-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap">
                                   <Plus size={18} /> Nuevo
                               </button>
                            </div>
                         </div>
                          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-700/50 text-slate-300">
                                    <tr>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleClientSort('name')}>
                                            <div className="flex items-center gap-1">
                                                Nombre
                                                {clientSortConfig.key === 'name' && (clientSortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                            </div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleClientSort('type')}>
                                            <div className="flex items-center gap-1">
                                                Tipo
                                                {clientSortConfig.key === 'type' && (clientSortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                            </div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleClientSort('orderCount')}>
                                            <div className="flex items-center gap-1">
                                                No. Pedidos
                                                {clientSortConfig.key === 'orderCount' && (clientSortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                            </div>
                                        </th>
                                        <th className="p-4">Contacto</th>
                                        <th className="p-4">Dirección</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {filteredClients.map(client => (
                                        <tr key={client.id} className="hover:bg-slate-700/30">
                                            <td className="p-4 font-bold">
                                                {client.name}
                                                <div className="text-xs text-slate-500 font-normal">ID: {client.id.slice(-6)}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded uppercase font-bold 
                                                    ${client.type === 'distribuidor' ? 'bg-purple-500/20 text-purple-400' : 
                                                      client.type === 'mayorista' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600/20 text-slate-400'}`}>
                                                    {client.type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-bold text-slate-300">
                                                {client.orderCount}
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">
                                                <div>{client.email}</div>
                                                <div>{client.phone}</div>
                                                {(client.facebook || client.instagram) && (
                                                    <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                                        {client.facebook && <span>FB: {client.facebook}</span>}
                                                        {client.instagram && <span>IG: {client.instagram}</span>}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-slate-400 max-w-xs truncate">
                                                {client.address || 'Sin dirección'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => setClientHistoryModal(client)}
                                                        className="p-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-200 rounded transition-colors"
                                                        title="Ver Historial"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditClientModal(client)} 
                                                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClient(client.id)} 
                                                        className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
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

                 {/* Leads */}
                 {activeTab === 'leads' && (
                     <div>
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                             <h2 className="text-3xl font-display font-bold">Cotizaciones</h2>
                             <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                 <button onClick={() => setNewLeadModal(true)} className="bg-brand-blue hover:bg-blue-600 px-3 py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm">
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
                                <div key={lead.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="w-full md:w-auto">
                                        <h3 className="font-bold">{lead.name}</h3>
                                        <p className="text-sm text-slate-400">{lead.details}</p>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
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

                 {/* Expenses */}
                 {activeTab === 'expenses' && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold">Gastos</h2>
                        
                        {/* Expense Form */}
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h3 className="font-bold text-lg mb-4">Registrar Nuevo Gasto</h3>
                            <form onSubmit={handleSubmitExpense} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Concepto / Material</label>
                                    <input name="concept" required placeholder="Ej. Madera, Pintura..." className="w-full bg-slate-900 border border-slate-600 rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Costo</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-500">$</span>
                                        <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full bg-slate-900 border border-slate-600 rounded p-2 pl-7" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Fecha de Pago</label>
                                    <input name="date" type="date" required className="w-full bg-slate-900 border border-slate-600 rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Método de Pago</label>
                                    <select name="method" className="w-full bg-slate-900 border border-slate-600 rounded p-2">
                                        <option value="Kueski">Kueski</option>
                                        <option value="Mercadolibre">MercadoLibre</option>
                                        <option value="Tarjeta">Tarjeta</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Transferencia">Transferencia</option>
                                    </select>
                                </div>
                                <div className="md:col-span-5 flex justify-end">
                                    <button type="submit" className="bg-brand-blue hover:bg-blue-600 px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                                        <Plus size={18} /> Registrar Gasto
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Expense Filters */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                             <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                 <div>
                                     <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Filtrar por Fecha</label>
                                     <input 
                                         type="date" 
                                         value={expenseFilter.date} 
                                         onChange={(e) => setExpenseFilter({...expenseFilter, date: e.target.value})} 
                                         className="bg-slate-800 border border-slate-700 rounded p-2 text-sm w-full md:w-auto"
                                     />
                                 </div>
                                 
                                 <div>
                                     <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Filtrar por Método</label>
                                     <select 
                                         value={expenseFilter.method} 
                                         onChange={(e) => setExpenseFilter({...expenseFilter, method: e.target.value})} 
                                         className="bg-slate-800 border border-slate-700 rounded p-2 text-sm w-full md:w-auto"
                                     >
                                         <option value="all">Ver Todos</option>
                                         <option value="Kueski">Kueski</option>
                                         <option value="Mercadolibre">MercadoLibre</option>
                                         <option value="Tarjeta">Tarjeta</option>
                                         <option value="Efectivo">Efectivo</option>
                                         <option value="Transferencia">Transferencia</option>
                                     </select>
                                 </div>

                                 {(expenseFilter.date || expenseFilter.method !== 'all') && (
                                     <div className="flex items-end">
                                         <button 
                                             onClick={() => setExpenseFilter({ date: '', method: 'all' })}
                                             className="text-brand-orange hover:text-orange-400 text-xs font-bold underline mb-3"
                                         >
                                             Limpiar Filtros
                                         </button>
                                     </div>
                                 )}
                             </div>
                        </div>

                        {/* Expenses Table */}
                        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-slate-700/50 text-slate-300">
                                    <tr>
                                        <th className="p-4">Concepto</th>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Método</th>
                                        <th className="p-4 text-right">Monto</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {filteredExpenses.map(expense => (
                                        <tr key={expense.id} className="hover:bg-slate-700/30">
                                            <td className="p-4 font-bold">{expense.concept}</td>
                                            <td className="p-4 text-slate-400 text-sm">{expense.date}</td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                <span className="bg-slate-700 px-2 py-1 rounded text-xs">{expense.method}</span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-red-400">-${parseFloat(expense.amount).toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => deleteExpense(expense.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredExpenses.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-500">No hay gastos coinciden con los filtros.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 )}
                 {/* Calculator Tab */}
                 {activeTab === 'calculator' && (
                     <div>
                          <h2 className="text-3xl font-display font-bold mb-6">Cotizador 3D</h2>
                          <PriceCalculator initialData={quoteToEdit} onCancel={() => setQuoteToEdit(null)} />
                     </div>
                 )}

                 {/* Saved Quotes History */}
                 {activeTab === 'saved_quotes' && (
                     <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-3xl font-display font-bold">Historial de Cotizaciones 3D</h2>
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                                   <input 
                                       type="text" 
                                       placeholder="Buscar cotización..." 
                                       value={quoteFilter.search}
                                       onChange={(e) => setQuoteFilter({...quoteFilter, search: e.target.value})}
                                       className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-blue"
                                   />
                                </div>
                                <select 
                                    className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm w-full md:w-auto focus:outline-none focus:border-brand-blue"
                                    value={quoteFilter.category}
                                    onChange={(e) => setQuoteFilter({...quoteFilter, category: e.target.value})}
                                >
                                    <option value="all">Todas las Categorías</option>
                                    {uniqueCategories.filter(c => c !== 'all').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Batch Action Bar */}
                        {selectedQuoteIds.size > 0 && (
                            <div className="bg-brand-blue/20 border border-brand-blue p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                <span className="font-bold text-brand-blue">{selectedQuoteIds.size} seleccionados</span>
                                <div className="flex-1 flex gap-2 w-full md:w-auto">
                                    <input 
                                        type="text" 
                                        placeholder="Nueva Categoría para selección..." 
                                        value={batchCategory}
                                        list="batch-categories-list"
                                        onChange={(e) => setBatchCategory(e.target.value)}
                                        className="flex-1 bg-slate-900 border border-brand-blue/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-blue"
                                    />
                                    <datalist id="batch-categories-list">
                                        {uniqueCategories.filter(c => c !== 'all').map(c => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                    <button 
                                        onClick={handleBatchUpdate}
                                        className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                                    >
                                        Actualizar Categoría
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-700/50 text-slate-300">
                                    <tr>
                                        <th className="p-4 w-10">
                                            <input 
                                                type="checkbox" 
                                                onChange={handleSelectAll}
                                                checked={selectedQuoteIds.size === filteredQuotes.length && filteredQuotes.length > 0}
                                                className="rounded border-slate-600 bg-slate-800 text-brand-orange focus:ring-brand-orange"
                                            />
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleQuoteSort('category')}>
                                            <div className="flex items-center gap-1">
                                                Categoría
                                                {quoteSortConfig.key === 'category' && (quoteSortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                            </div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleQuoteSort('name')}>
                                             <div className="flex items-center gap-1">
                                                Pieza
                                                {quoteSortConfig.key === 'name' && (quoteSortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                            </div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleQuoteSort('date')}>
                                             <div className="flex items-center gap-1">
                                                Fecha
                                                {quoteSortConfig.key === 'date' && (quoteSortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                            </div>
                                        </th>
                                        <th className="p-4">Peso</th>
                                        <th className="p-4">Tiempo</th>
                                        <th className="p-4">Costo Prod.</th>
                                        <th className="p-4 text-brand-orange font-bold">Precio Final</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {filteredQuotes.map(quote => (
                                        <tr key={quote.id} className={`hover:bg-slate-700/30 ${selectedQuoteIds.has(quote.id) ? 'bg-brand-blue/10' : ''}`}>
                                            <td className="p-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedQuoteIds.has(quote.id)}
                                                    onChange={() => handleSelectQuote(quote.id)}
                                                    className="rounded border-slate-600 bg-slate-800 text-brand-orange focus:ring-brand-orange"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(quote.category) ? quote.category : [quote.category]).filter(Boolean).map((cat, idx) => (
                                                        <span key={idx} className="bg-slate-700 px-2 py-1 rounded text-xs font-bold text-slate-300 whitespace-nowrap">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                    {(!quote.category || (Array.isArray(quote.category) && quote.category.length === 0)) && (
                                                        <span className="text-slate-500 text-xs italic">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-white">{quote.name}</td>
                                            <td className="p-4 text-sm text-slate-400">{new Date(quote.date).toLocaleDateString()}</td>
                                            <td className="p-4 text-sm text-slate-300">{quote.params?.weight}g</td>
                                            <td className="p-4 text-sm text-slate-300">{quote.params?.timeHours}h {quote.params?.timeMinutes}m</td>
                                            <td className="p-4 font-mono text-slate-400 text-xs">
                                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(quote.costs?.total || 0)}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-brand-orange">
                                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(quote.costs?.suggested || 0)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                     <button 
                                                        onClick={() => handleEditQuote(quote)}
                                                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400"
                                                        title="Editar"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDetailsModal({type: 'quote', data: quote})}
                                                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-brand-orange"
                                                        title="Ver Detalles"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => { if(confirm('Borrar cotización?')) deleteQuote(quote.id) }} 
                                                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-red-400"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredQuotes.length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="p-8 text-center text-slate-500">
                                                No hay cotizaciones guardadas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                                             <input 
                                                 name="advance" 
                                                 type="number" 
                                                 defaultValue={editingOrderId ? orders.find(o => o.id === editingOrderId)?.advance : "0"} 
                                                 className="w-24 bg-black/50 border border-slate-700 rounded p-1 text-right text-sm" 
                                             />
                                        </div>
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700">
                                            <span className="text-xs text-gray-400">Fecha Entrega:</span>
                                            <input 
                                                name="deadline" 
                                                type="date" 
                                                defaultValue={editingOrderId ? orders.find(o => o.id === editingOrderId)?.deadline : ""}
                                                className="w-32 bg-black/50 border border-slate-700 rounded p-1 text-right text-sm" 
                                            />
                                        </div>
                                         <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700">
                                            <span className="text-xs text-gray-400">Evidencia:</span>
                                            <input 
                                                name="orderImage" 
                                                type="file" 
                                                accept="image/*"
                                                className="w-32 text-xs text-slate-500 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-brand-blue file:text-white hover:file:bg-blue-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Entrega</label>
                                    <textarea 
                                        id="deliveryInput" 
                                        name="delivery" 
                                        defaultValue={editingOrderId ? orders.find(o => o.id === editingOrderId)?.deliveryLocation : ""}
                                        placeholder="Dirección de entrega..." 
                                        className="w-full h-20 bg-slate-900 border border-slate-600 rounded p-2 text-sm resize-none mb-4" 
                                        required
                                    ></textarea>

                                    <label className="block text-xs mb-1 text-slate-400 font-bold uppercase">Link de Evidencia (Drive/Fotos)</label>
                                    <input 
                                        name="evidenceLink" 
                                        type="url"
                                        placeholder="https://drive.google.com/..."
                                        defaultValue={editingOrderId ? orders.find(o => o.id === editingOrderId)?.evidenceLink : ""}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-blue-400" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-700 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setNewOrderModal(false)} 
                                className="text-slate-400 hover:text-white"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className={`px-6 py-2 rounded font-bold text-white transition-all flex items-center gap-2
                                    ${isSubmitting ? 'bg-slate-600 cursor-not-allowed' : 'bg-brand-blue hover:bg-blue-600'}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    `${editingOrderId ? 'Actualizar Pedido' : 'Crear Pedido'} ($${orderTotal.toFixed(2)})`
                                )}
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

            {/* Client History Modal */}
            {clientHistoryModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold">Historial de Pedidos</h3>
                                <p className="text-slate-400">{clientHistoryModal.name}</p>
                            </div>
                            <button onClick={() => setClientHistoryModal(null)} className="p-1 hover:bg-slate-700 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                             <table className="w-full text-left font-sm">
                                <thead className="bg-slate-800 text-slate-300">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Fecha</th>
                                        <th className="p-3">Artículos</th>
                                        <th className="p-3">Pagos</th>
                                        <th className="p-3">Estatus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {orders.filter(o => o.clientId === clientHistoryModal.id).map(order => (
                                        <tr key={order.id} className="hover:bg-slate-800">
                                            <td className="p-3 text-xs text-slate-500 align-top">#{order.id.slice(-4)}</td>
                                            <td className="p-3 text-sm align-top whitespace-nowrap">{order.date}</td>
                                            <td className="p-3 align-top min-w-[200px]">
                                                {order.items && order.items.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="text-sm">
                                                                <span className="text-slate-300 font-bold">{item.qty}x</span> {item.desc}
                                                                {item.price && <span className="text-slate-500 text-xs ml-1">(${item.price})</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 text-sm">{order.desc || order.details}</span>
                                                )}
                                            </td>
                                            <td className="p-3 align-top min-w-[150px]">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">Total:</span>
                                                    <span className="font-bold">${order.total}</span>
                                                </div>
                                                <div className="flex justify-between text-xs mt-1">
                                                    <span className="text-slate-500">Anticipo:</span>
                                                    <span className="text-green-500">-${order.advance || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-xs mt-1 border-t border-slate-700 pt-1">
                                                    <span className="text-slate-400">Resta:</span>
                                                    <span className={`font-bold ${(order.remaining > 0 || (order.total - (order.advance || 0)) > 0) ? 'text-brand-orange' : 'text-slate-500'}`}>
                                                        ${order.remaining ?? (order.total - (order.advance || 0))}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3 align-top">
                                                 <span className={`text-xs px-2 py-1 rounded uppercase font-bold border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.filter(o => o.clientId === clientHistoryModal.id).length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-6 text-center text-slate-500">Este cliente no tiene pedidos registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                             </table>
                        </div>
                    </div>
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
