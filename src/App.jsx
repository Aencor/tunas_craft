import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ShippingPolicy from './pages/ShippingPolicy';
import Guides from './pages/Guides';
import { CartProvider } from './context/CartContext';

function AnalyticsTracker() {
  const location = useLocation();
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    // Meta Pixel SPA PageView
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
    // Google Analytics SPA PageView
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-BMF86Q9D45', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AnalyticsTracker />
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
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos" element={<Terms />} />
          <Route path="/envios-devoluciones" element={<ShippingPolicy />} />
          <Route path="/guias" element={<Guides />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
