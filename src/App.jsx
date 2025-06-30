import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';
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

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
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

              {/* Placeholder routes */}
              <Route path="reports" element={<div className="p-6"><h1 className="page-title">Reports</h1><p>Reports page coming soon...</p></div>} />
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
    </ErrorBoundary>
  );
}

export default App;
