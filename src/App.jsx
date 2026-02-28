import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import Quote from './pages/Quote';
import StoreSale from './pages/StoreSale';
import OrderStatus from './pages/OrderStatus';
import Catalog from './pages/Catalog';
import PublicScanner from './pages/PublicScanner';
import PublicManualQuote from './pages/PublicManualQuote';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/status" element={<OrderStatus />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/venta-tienda" element={<StoreSale />} />
          <Route path="/venta-fisica" element={<StoreSale />} />
          <Route path="/cotizador" element={<PublicScanner />} />
          <Route path="/calculadora" element={<PublicManualQuote />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
