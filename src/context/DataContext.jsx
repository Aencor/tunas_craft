import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // Entities
    const [clients, setClients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [leads, setLeads] = useState([]);
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Collections References
    const clientsCollection = collection(db, 'clients');
    const ordersCollection = collection(db, 'orders');
    const leadsCollection = collection(db, 'leads');

    // Auth & Listeners
    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
            
            if (currentUser) {
                // Subscribe to data only when logged in
                const unsubClients = onSnapshot(clientsCollection, (snapshot) => {
                    setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                });
                const unsubOrders = onSnapshot(ordersCollection, (snapshot) => {
                    setOrders(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                });
                const unsubLeads = onSnapshot(leadsCollection, (snapshot) => {
                    setLeads(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                });

                return () => {
                    unsubClients();
                    unsubOrders();
                    unsubLeads();
                };
            } else {
                // Clear state on logout
                setClients([]);
                setOrders([]);
                setLeads([]);
            }
        });

        return () => unsubAuth();
    }, []);

    const login = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed", error);
            if (error.code === 'auth/unauthorized-domain') {
                alert("Error: El dominio no está autorizado. Ve a Firebase Console -> Authentication -> Settings -> Authorized Domains y agrega 'tunascraft.com'.");
            } else {
                alert("Error al iniciar sesión: " + error.message);
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // --- Actions ---

    // CLIENTS
    const addClient = async (client) => {
        try {
            const newHelper = { 
                ...client, 
                joinedAt: new Date().toISOString() 
            };
            const docRef = await addDoc(clientsCollection, newHelper);
            return { ...newHelper, id: docRef.id };
        } catch (error) {
            console.error("Error adding client:", error);
            alert(`Error guardando cliente: ${error.code} - ${error.message}`);
            throw error;
        }
    };

    const updateClient = async (id, updates) => {
        const docRef = doc(db, 'clients', id);
        await updateDoc(docRef, updates);
    };

    const deleteClient = async (id) => {
        try {
            const docRef = doc(db, 'clients', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting client:", error);
            alert(`Error al eliminar cliente: ${error.code} - ${error.message}`);
        }
    };

    // ORDERS
    const addOrder = async (order) => {
        // ... (rest of addOrder is fine, not replacing it, just ensuring context match)
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
        try {
            const docRef = doc(db, 'orders', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting order:", error);
            alert(`Error al eliminar pedido: ${error.code} - ${error.message}`);
        }
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
            clients, orders, leads, user, loadingAuth,
            login, logout,
            addClient, updateClient, deleteClient,
            addOrder, updateOrderStatus, updateOrder, deleteOrder,
            addLead, updateLeadStatus,
            importDatabase
        }}>
            {children}
        </DataContext.Provider>
    );
};
