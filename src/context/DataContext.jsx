import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Default Administrator Credentials
export const DEFAULT_ADMIN_USERS = [
    {
        email: 'kikemura07@gmail.com',
        password: 'LordPug$040786',
        displayName: 'Enrique',
        role: 'admin'
    },
    {
        email: 'dreaminginwinter@gmail.com',
        password: 'aeryjun25',
        displayName: 'Xio',
        role: 'admin'
    }
];

const ALLOWED_EMAILS = DEFAULT_ADMIN_USERS.map(u => u.email.toLowerCase());

export const DataProvider = ({ children }) => {
    // Entities
    const [clients, setClients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [leads, setLeads] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [products, setProducts] = useState([]); // New state for products
    const [coupons, setCoupons] = useState([]); // New state for coupons
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Collections References
    const clientsCollection = collection(db, 'clients');
    const ordersCollection = collection(db, 'orders');
    const leadsCollection = collection(db, 'leads');
    const expensesCollection = collection(db, 'expenses');
    const quotesCollection = collection(db, 'saved_quotes');
    const productsCollection = collection(db, 'products'); // New collection
    const couponsCollection = collection(db, 'coupons'); // New collection

    // Initial Auth Restoration from Local Storage & Firebase
    useEffect(() => {
        let isMounted = true;

        const checkSavedSession = async () => {
            try {
                const stored = localStorage.getItem('tc_admin_session');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && parsed.email && ALLOWED_EMAILS.includes(parsed.email.toLowerCase())) {
                        if (isMounted) setUser(parsed);

                        // Ensure anonymous auth is active in background for Firestore security rules (non-blocking)
                        if (!auth.currentUser) {
                            signInAnonymously(auth).catch(e => console.warn('Background anonymous auth:', e));
                        }
                    } else {
                        localStorage.removeItem('tc_admin_session');
                    }
                }
            } catch (e) {
                console.warn('Session parse error:', e);
            } finally {
                if (isMounted) setLoadingAuth(false);
            }
        };

        checkSavedSession();

        // Also listen to Google / Firebase Auth state changes
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && currentUser.email) {
                if (!ALLOWED_EMAILS.includes(currentUser.email.toLowerCase())) {
                    signOut(auth);
                    if (isMounted) {
                        setUser(null);
                        setLoadingAuth(false);
                    }
                    return;
                }
                const session = {
                    email: currentUser.email,
                    displayName: currentUser.displayName || currentUser.email.split('@')[0],
                    role: 'admin',
                    uid: currentUser.uid
                };
                try {
                    localStorage.setItem('tc_admin_session', JSON.stringify(session));
                } catch (e) {}
                if (isMounted) {
                    setUser(session);
                    setLoadingAuth(false);
                }
            }
        });

        return () => {
            isMounted = false;
            unsubAuth();
        };
    }, []);

    // Subscribe to Firestore collections whenever user is authenticated
    useEffect(() => {
        if (!user) {
            setClients([]);
            setOrders([]);
            setLeads([]);
            setExpenses([]);
            setQuotes([]);
            setProducts([]);
            setCoupons([]);
            return;
        }

        const unsubClients = onSnapshot(clientsCollection, (snapshot) => {
            setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (err) => console.warn('Error reading clients:', err));

        const unsubOrders = onSnapshot(ordersCollection, (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (err) => console.warn('Error reading orders:', err));

        const unsubLeads = onSnapshot(leadsCollection, (snapshot) => {
            setLeads(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (err) => console.warn('Error reading leads:', err));

        const unsubExpenses = onSnapshot(expensesCollection, (snapshot) => {
            setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (err) => console.warn('Error reading expenses:', err));

        const unsubQuotes = onSnapshot(quotesCollection, (snapshot) => {
            setQuotes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (err) => console.warn('Error reading quotes:', err));

        const unsubProducts = onSnapshot(productsCollection, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (err) => console.warn('Error reading products:', err));

        const unsubCoupons = onSnapshot(couponsCollection, (snapshot) => {
            setCoupons(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (err) => console.warn('Error reading coupons:', err));

        return () => {
            unsubClients();
            unsubOrders();
            unsubLeads();
            unsubExpenses();
            unsubQuotes();
            unsubProducts();
            unsubCoupons();
        };
    }, [user]);

    // Login with Email & Password
    const loginWithEmail = async (email, password) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        const matched = DEFAULT_ADMIN_USERS.find(
            u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
        );

        if (!matched) {
            return {
                success: false,
                error: 'Correo o contraseña incorrectos. Verifica tus datos de acceso.'
            };
        }

        const adminSession = {
            email: matched.email,
            displayName: matched.displayName,
            role: matched.role,
            uid: auth.currentUser?.uid || `admin_${matched.email}`,
            loginAt: Date.now()
        };

        try {
            localStorage.setItem('tc_admin_session', JSON.stringify(adminSession));
        } catch (e) {
            console.warn('Could not save session in localStorage', e);
        }

        // Set user immediately so admin dashboard opens with zero delay
        setUser(adminSession);

        // Attempt anonymous auth in the background without blocking UI login
        if (!auth.currentUser) {
            signInAnonymously(auth).catch(err => {
                console.warn('Background anon auth notice:', err);
            });
        }

        return { success: true, user: adminSession };
    };

    // Login with Google (Alternative)
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const googleUser = result.user;
            if (googleUser && !ALLOWED_EMAILS.includes(googleUser.email.toLowerCase())) {
                await signOut(auth);
                alert("Acceso denegado: El correo no está autorizado para acceder al panel de administración.");
                setUser(null);
                return { success: false, error: 'Correo no autorizado' };
            }
            const adminSession = {
                email: googleUser.email,
                displayName: googleUser.displayName || googleUser.email.split('@')[0],
                role: 'admin',
                uid: googleUser.uid,
                loginAt: Date.now()
            };
            try {
                localStorage.setItem('tc_admin_session', JSON.stringify(adminSession));
            } catch (e) {}
            setUser(adminSession);
            return { success: true, user: adminSession };
        } catch (error) {
            console.error("Login failed", error);
            if (error.code === 'auth/unauthorized-domain') {
                alert("Error: El dominio no está autorizado. Ve a Firebase Console -> Authentication -> Settings -> Authorized Domains y agrega 'tunascraft.com'.");
            } else {
                alert("Error al iniciar sesión con Google: " + error.message);
            }
            return { success: false, error: error.message };
        }
    };

    // Logout
    const logout = async () => {
        try {
            localStorage.removeItem('tc_admin_session');
            setUser(null);
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
            localStorage.removeItem('tc_admin_session');
            setUser(null);
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
        // Add shortId derived from the auto-generated ID
        const shortId = docRef.id.slice(-4);
        await updateDoc(docRef, { shortId });
        
        return { ...newOrder, id: docRef.id, shortId };
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

    // EXPENSES
    const addExpense = async (expense) => {
        const newExpense = {
            ...expense,
            amount: parseFloat(expense.amount),
            date: expense.date || new Date().toISOString()
        };
        const docRef = await addDoc(expensesCollection, newExpense);
        return { ...newExpense, id: docRef.id };
    };

    const deleteExpense = async (id) => {
        try {
            const docRef = doc(db, 'expenses', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert(`Error al eliminar gasto: ${error.code} - ${error.message}`);
        }
    };

    // SAVED QUOTES
    const addQuote = async (quote) => {
        const newQuote = {
            ...quote,
            date: new Date().toISOString()
        };
        const docRef = await addDoc(quotesCollection, newQuote);
        return { ...newQuote, id: docRef.id };
    };

    const deleteQuote = async (id) => {
        try {
            const docRef = doc(db, 'saved_quotes', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting quote:", error);
            alert(`Error al eliminar cotización: ${error.code} - ${error.message}`);
        }
    };

    const updateQuote = async (id, updates) => {
        try {
            const docRef = doc(db, 'saved_quotes', id);
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error("Error updating quote:", error);
            alert(`Error al actualizar cotización: ${error.code} - ${error.message}`);
            throw error;
        }
    };

    // PRODUCTS
    const addProduct = async (product) => {
        try {
            const newProduct = {
                ...product,
                createdAt: new Date().toISOString()
            };
            const docRef = await addDoc(productsCollection, newProduct);
            return { ...newProduct, id: docRef.id };
        } catch (error) {
            console.error("Error adding product:", error);
            alert(`Error guardando producto: ${error.code} - ${error.message}`);
            throw error;
        }
    };

    const updateProduct = async (id, updates) => {
        try {
            const docRef = doc(db, 'products', id);
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error("Error updating product:", error);
            alert(`Error al actualizar producto: ${error.code} - ${error.message}`);
            throw error;
        }
    };

    const deleteProduct = async (id) => {
        try {
            const docRef = doc(db, 'products', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting product:", error);
            alert(`Error al eliminar producto: ${error.code} - ${error.message}`);
            throw error;
        }
    };

    // COUPONS
    const addCoupon = async (coupon) => {
        try {
            const newCoupon = {
                ...coupon,
                createdAt: new Date().toISOString()
            };
            const docRef = await addDoc(couponsCollection, newCoupon);
            return { ...newCoupon, id: docRef.id };
        } catch (error) {
            console.error("Error adding coupon:", error);
            alert(`Error guardando cupón: ${error.code} - ${error.message}`);
            throw error;
        }
    };

    const updateCoupon = async (id, updates) => {
        try {
            const docRef = doc(db, 'coupons', id);
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error("Error updating coupon:", error);
            alert(`Error al actualizar cupón: ${error.code} - ${error.message}`);
            throw error;
        }
    };

    const deleteCoupon = async (id) => {
        try {
            const docRef = doc(db, 'coupons', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting coupon:", error);
            alert(`Error al eliminar cupón: ${error.code} - ${error.message}`);
            throw error;
        }
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
            login: loginWithEmail, loginWithEmail, loginWithGoogle, logout,
            DEFAULT_ADMIN_USERS,
            addClient, updateClient, deleteClient,
            addOrder, updateOrderStatus, updateOrder, deleteOrder,
            addLead, updateLeadStatus,
            expenses, addExpense, deleteExpense,
            quotes, addQuote, deleteQuote, updateQuote,
            products, addProduct, updateProduct, deleteProduct,
            coupons, addCoupon, updateCoupon, deleteCoupon,
            importDatabase
        }}>
            {children}
        </DataContext.Provider>
    );
};
