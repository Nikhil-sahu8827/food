import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OpenStatusBanner } from './components/OpenStatusBanner';
import { CartDrawer } from './components/CartDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminOrderNotifier } from './components/AdminOrderNotifier';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { MyOrders } from './pages/MyOrders';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminMenu } from './pages/admin/AdminMenu';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminMonitoring } from './pages/admin/AdminMonitoring';

export const App = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {isAdminRoute ? (
        // Admin Console Layout
        <div className="flex-1 flex flex-col md:flex-row relative">
          <AdminOrderNotifier />
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
            <Routes>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminMenu />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/monitoring"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminMonitoring />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      ) : (
        // Customer Facing Storefront Layout
        <div className="flex-1 flex flex-col">
          <OpenStatusBanner />
          <Navbar onOpenCart={() => setCartOpen(true)} />
          <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          
          <main className="flex-1 pb-24 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>

          <Footer />
          <MobileBottomNav onOpenCart={() => setCartOpen(true)} />
        </div>
      )}
    </div>
  );
};

export default App;
