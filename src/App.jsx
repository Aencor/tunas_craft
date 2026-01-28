import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import Quote from './pages/Quote';
import StoreSale from './pages/StoreSale';
import OrderStatus from './pages/OrderStatus';

function App() {
  return (
    <Router basename="/tunas_craft">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/status" element={<OrderStatus />} />
        <Route path="/venta-tienda" element={<StoreSale />} />
        <Route path="/venta-fisica" element={<StoreSale />} />
      </Routes>
    </Router>
  );
}

export default App;
