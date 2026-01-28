import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // Entities
    const [clients, setClients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [leads, setLeads] = useState([]);
    const [user, setUser] = useState(null);

    // Collections References
    const clientsCollection = collection(db, 'clients');
    const ordersCollection = collection(db, 'orders');
    const leadsCollection = collection(db, 'leads');

    // Init Logic - Realtime Listeners
    useEffect(() => {
        // 1. Sign In Anonymously
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                console.log("Firebase Auth: Signed in as", currentUser.uid);
                setUser(currentUser);
                
                // 2. Start Listeners ONLY after auth
                const unsubClients = onSnapshot(clientsCollection, (snapshot) => {
                    setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                }, (error) => console.error("Error reading clients:", error));

                const unsubOrders = onSnapshot(ordersCollection, (snapshot) => {
                    setOrders(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                }, (error) => console.error("Error reading orders:", error));

                const unsubLeads = onSnapshot(leadsCollection, (snapshot) => {
                    setLeads(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                }, (error) => console.error("Error reading leads:", error));

                return () => {
                    unsubClients();
                    unsubOrders();
                    unsubLeads();
                };
            } else {
                console.log("Firebase Auth: Signing in...");
                signInAnonymously(auth).catch((error) => console.error("Auth Failed:", error));
            }
        });

        return () => unsubAuth();
    }, []);

    // --- Actions ---

    // CLIENTS
    const addClient = async (client) => {
        const newHelper = { 
            ...client, 
            joinedAt: new Date().toISOString() 
        };
        const docRef = await addDoc(clientsCollection, newHelper);
        return { ...newHelper, id: docRef.id };
    };

    const updateClient = async (id, updates) => {
        const docRef = doc(db, 'clients', id);
        await updateDoc(docRef, updates);
    };

    // ORDERS
    const addOrder = async (order) => {
        // Logic: Check client type for discount
        // Note: 'clients' state is up-to-date due to real-time listener
        let finalTotal = parseFloat(order.total);
        const client = clients.find(c => c.id === order.clientId);
        
        if (client) {
            if (client.type === 'mayorista') finalTotal *= 0.90; // 10% off
            if (client.type === 'distribuidor') finalTotal *= 0.75; // 25% off
        }

        const newOrder = { 
            ...order, 
            total: finalTotal.toFixed(2),
            remaining: (finalTotal - (order.advance || 0)).toFixed(2),
            date: new Date().toLocaleDateString('es-MX'),
            status: order.status || 'pedido' 
        };

        const docRef = await addDoc(ordersCollection, newOrder);
        return { ...newOrder, id: docRef.id };
    };

    const updateOrderStatus = async (id, status) => {
        const docRef = doc(db, 'orders', id);
        await updateDoc(docRef, { status });
    };

    const updateOrder = async (id, updates) => {
        const docRef = doc(db, 'orders', id);
        await updateDoc(docRef, updates);
    };

    // Expose updateOrder globally for the Admin hack (or pass it properly)
    useEffect(() => {
        window.updateOrderContext = updateOrder;
    }, [orders]);

    const deleteOrder = async (id) => {
        const docRef = doc(db, 'orders', id);
        await deleteDoc(docRef);
    };

    // LEADS
    const addLead = async (lead) => {
        const newLead = { 
            ...lead, 
            date: new Date().toLocaleDateString('es-MX'), 
            status: 'Nuevo' 
        };
        const docRef = await addDoc(leadsCollection, newLead);
        return { ...newLead, id: docRef.id };
    };

    const updateLeadStatus = async (id, status) => {
        const docRef = doc(db, 'leads', id);
        await updateDoc(docRef, { status });
    };

    // BULK IMPORT (Optional implementation for Firebase)
    const importDatabase = async (data) => {
        // Note: This would be expensive in valid reads/writes, implementing naive version
        // Ideally, use batch writes
        // For now, disabling or just warning logic
        console.warn("Import not fully supported in Firebase version yet.");
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
