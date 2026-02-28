import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // Load initial cart state from localStorage
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('tunas_craft_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save to localStorage whenever cartItems changes
    useEffect(() => {
        localStorage.setItem('tunas_craft_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Derived state
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => {
        // Price might be formatted as "$100.00"
        const priceNum = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : item.price;
        return acc + (priceNum || 0) * item.quantity;
    }, 0);

    // Actions
    const addToCart = (product) => {
        setCartItems((prev) => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                // Determine available quantity (assuming product.quantity exists and represents stock)
                const stock = parseInt(product.quantity, 10);
                if (!isNaN(stock) && existingItem.quantity >= stock) {
                    // Cannot add more than stock
                    return prev;
                }
                
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setCartItems((prev) =>
            prev.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            totalItems,
            cartTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
