import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // Entities
    const [clients, setClients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [leads, setLeads] = useState([]);

    // Init Logic
    useEffect(() => {
        fetch('/api/db')
            .then(res => res.json())
            .then(data => {
                if(data.clients) setClients(data.clients);
                if(data.orders) setOrders(data.orders);
                if(data.leads) setLeads(data.leads);
            })
            .catch(err => console.error('Failed to load DB', err));
    }, []);

    // Persistence Helper
    const saveToApi = (newClients, newOrders, newLeads) => {
        // Optimistic update state
        if(newClients) setClients(newClients);
        if(newOrders) setOrders(newOrders);
        if(newLeads) setLeads(newLeads);

        // Current state + updates
        const payload = {
            clients: newClients || clients,
            orders: newOrders || orders,
            leads: newLeads || leads
        };

        fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error('Failed to save DB', err));
    };

    // --- Actions ---

    // CLIENTS
    const addClient = (client) => {
        const newHelper = { ...client, id: Date.now().toString(), joinedAt: new Date().toISOString() };
        const updated = [newHelper, ...clients];
        saveToApi(updated, null, null);
        return newHelper;
    };

    const updateClient = (id, updates) => {
        const updated = clients.map(c => c.id === id ? { ...c, ...updates } : c);
        saveToApi(updated, null, null);
    };

    // ORDERS
    const addOrder = (order) => {
        // Logic: Check client type for discount
        let finalTotal = parseFloat(order.total);
        const client = clients.find(c => c.id === order.clientId);
        
        if (client) {
            if (client.type === 'mayorista') finalTotal *= 0.90; // 10% off
            if (client.type === 'distribuidor') finalTotal *= 0.75; // 25% off
        }

        const newOrder = { 
            ...order, 
            id: order.id || Date.now().toString(), 
            total: finalTotal.toFixed(2),
            remaining: (finalTotal - (order.advance || 0)).toFixed(2),
            date: new Date().toLocaleDateString('es-MX'),
            status: order.status || 'pedido' 
        };

        const updated = [newOrder, ...orders];
        saveToApi(null, updated, null);
        return newOrder;
    };

    const updateOrderStatus = (id, status) => {
        const updated = orders.map(o => o.id === id ? { ...o, status } : o);
        saveToApi(null, updated, null);
    };

    const updateOrder = (id, updates) => {
        const updated = orders.map(o => o.id === id ? { ...o, ...updates } : o);
        saveToApi(null, updated, null);
    };

    // Expose updateOrder globally for the Admin hack (or pass it properly)
    useEffect(() => {
        window.updateOrderContext = updateOrder;
    }, [orders]);

    const deleteOrder = (id) => {
        const updated = orders.filter(o => o.id !== id);
        saveToApi(null, updated, null);
    };

    // LEADS
    const addLead = (lead) => {
        const newLead = { ...lead, id: Date.now().toString(), date: new Date().toLocaleDateString('es-MX'), status: 'Nuevo' };
        const updated = [newLead, ...leads];
        saveToApi(null, null, updated);
        return newLead;
    };

    const updateLeadStatus = (id, status) => {
        const updated = leads.map(l => l.id === id ? { ...l, status } : l);
        saveToApi(null, null, updated);
    };

    // BULK IMPORT
    const importDatabase = (data) => {
        saveToApi(data.clients, data.orders, data.leads);
    };

    return (
        <DataContext.Provider value={{
            clients, orders, leads,
            addClient, updateClient,
            addOrder, updateOrderStatus, updateOrder, deleteOrder,
            addLead, updateLeadStatus,
            importDatabase
        }}>
            {children}
        </DataContext.Provider>
    );
};
