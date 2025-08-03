import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { ShopProvider } from './contexts/ShopContext';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './pages/Dashboard';

// Customer pages
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetail from './pages/customers/CustomerDetail';

// Product pages
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetail from './pages/products/ProductDetail';

// Transaction pages
import TransactionList from './pages/transactions/TransactionList';
import TransactionForm from './pages/transactions/TransactionForm';
import TransactionDetail from './pages/transactions/TransactionDetail';
import PaymentForm from './pages/transactions/PaymentForm';

// Analytics pages
import Analytics from './pages/Analytics';
import AdvancedAnalytics from './pages/AdvancedAnalytics';

// Invoice pages
import Invoices from './pages/Invoices';
import InvoiceCreate from './pages/InvoiceCreate';

// Shop pages
import ShopForm from './pages/shops/ShopForm';

// Profile page
import Profile from './pages/Profile';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ShopProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  {/* Dashboard */}
                  <Route index element={<Dashboard />} />

              {/* Customer routes */}
              <Route path="customers" element={<CustomerList />} />
              <Route path="customers/new" element={<CustomerForm />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="customers/:id/edit" element={<CustomerForm />} />

              {/* Product routes */}
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="products/:id/edit" element={<ProductForm />} />

              {/* Transaction routes */}
              <Route path="transactions" element={<TransactionList />} />
              <Route path="transactions/new" element={<TransactionForm />} />
              <Route path="transactions/:id" element={<TransactionDetail />} />
              <Route path="transactions/:id/pay" element={<PaymentForm />} />

              {/* Analytics routes */}
              <Route path="analytics" element={<AdvancedAnalytics />} />
              <Route path="reports" element={<Analytics />} />

              {/* Invoice routes */}
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/create" element={<InvoiceCreate />} />

              {/* Shop routes */}
              <Route path="shops/create" element={<ShopForm />} />
              <Route path="shops/:id/edit" element={<ShopForm />} />

              {/* Profile route */}
              <Route path="profile" element={<Profile />} />

              {/* Placeholder routes */}
              <Route path="settings" element={<div className="p-6"><h1 className="page-title">Settings</h1><p>Settings page coming soon...</p></div>} />
            </Route>

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </Router>
        </ShopProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
