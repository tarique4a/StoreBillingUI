import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CubeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { analyticsAPI, analyticsRequestBuilder, formatCurrency, formatDate } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentShop, loading: shopLoading } = useShop();

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalPaidAmount: 0,
    totalDueAmount: 0,
    recentTransactions: [],
    lowStockProducts: [],
    topSellingProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only load data when user is authenticated and shop is selected
    if (isAuthenticated && currentShop && !shopLoading) {
      loadDashboardData();
    } else if (isAuthenticated && !shopLoading && !currentShop) {
      // User is authenticated but no shop selected
      setLoading(false);
    }
  }, [isAuthenticated, currentShop, shopLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Execute all analytics queries in parallel using the new flexible API
      const [
        dashboardResponse,
        customerResponse,
        productResponse,
        recentTransactionsResponse,
        lowStockResponse,
        topProductsResponse
      ] = await Promise.all([
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.dashboard()),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.customerAnalytics()),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.productAnalytics()),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.recentTransactions(10)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.lowStockProducts(10, 5)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.topProducts(5))
      ]);

      // Extract data from responses
      const dashboardData = dashboardResponse.data;
      const customerData = customerResponse.data;
      const productData = productResponse.data;
      const recentData = recentTransactionsResponse.data;
      const lowStockData = lowStockResponse.data;
      const topProductsData = topProductsResponse.data;

      // Combine all data into dashboard stats
      const combinedStats = {
        totalCustomers: customerData.aggregations?.totalCustomers || 0,
        totalProducts: productData.aggregations?.totalProducts || 0,
        totalTransactions: dashboardData.aggregations?.totalTransactions || 0,
        totalRevenue: dashboardData.aggregations?.totalRevenue || 0,
        totalPaidAmount: dashboardData.aggregations?.totalPaidAmount || 0,
        totalDueAmount: (dashboardData.aggregations?.totalRevenue || 0) - (dashboardData.aggregations?.totalPaidAmount || 0),
        recentTransactions: recentData.rawData || [],
        lowStockProducts: lowStockData.rawData || [],
        topSellingProducts: topProductsData.aggregations?.topProducts || [],
      };

      setStats(combinedStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      // Keep default values on error
      setStats({
        totalCustomers: 0,
        totalProducts: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        totalPaidAmount: 0,
        totalDueAmount: 0,
        recentTransactions: [],
        lowStockProducts: [],
        topSellingProducts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading || shopLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show no shop selected state
  if (!currentShop) {
    return (
      <div className="text-center py-12">
        <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No shop selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create or select a shop to view your dashboard
        </p>
        <div className="mt-6">
          <Link to="/shops/create" className="btn-primary">
            Create Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome to your Store & Billing system overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/customers" className="text-sm text-primary-600 hover:text-primary-500">
                View all customers →
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <CubeIcon className="h-5 w-5 text-success-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/products" className="text-sm text-primary-600 hover:text-primary-500">
                Manage inventory →
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-warning-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-500">
                View transactions →
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Total Revenue</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Due Amount</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalDueAmount)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-red-600">Pending Payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/customers/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Add Customer</h3>
                  <p className="text-sm text-gray-500">Create a new customer profile</p>
                </div>
              </div>
            </Link>

            <Link
              to="/products/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <CubeIcon className="h-8 w-8 text-success-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Add Product</h3>
                  <p className="text-sm text-gray-500">Add new product to inventory</p>
                </div>
              </div>
            </Link>

            <Link
              to="/transactions/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-warning-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">New Transaction</h3>
                  <p className="text-sm text-gray-500">Create a new sales transaction</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
              <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {stats.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by creating your first transaction.
                </p>
                <div className="mt-6">
                  <Link to="/transactions/new" className="btn-primary">
                    Create Transaction
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((transaction) => (
                    <div key={transaction.id || Math.random()} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          #{transaction.id ? transaction.id.slice(-8) : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">{transaction.customerName || 'Unknown Customer'}</p>
                        <p className="text-xs text-gray-400">{transaction.createdTime ? formatDate(transaction.createdTime) : 'N/A'}</p>
                      </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Paid: {formatCurrency(transaction.totalPaidAmount)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.transactionStatus === 'CLOSED'
                          ? 'bg-green-100 text-green-800'
                          : transaction.transactionStatus === 'PARTIAL_PAID'
                          ? 'bg-yellow-100 text-yellow-800'
                          : transaction.transactionStatus === 'CREATED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.transactionStatus}
                      </span>
                    </div>
                  </div>
                ))
                ) : (
                  <div className="text-center py-6">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent transactions</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start by creating your first transaction
                    </p>
                    <div className="mt-6">
                      <Link to="/transactions/new" className="btn-primary">
                        Create Transaction
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Low Stock Alert</h2>
              <Link to="/products" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {stats.lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">All products in stock</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No products are running low on stock.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                  stats.lowStockProducts.map((product) => (
                    <div key={product.id || Math.random()} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-500">{product.brand || 'No Brand'}</p>
                      </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-danger-600">
                        {product.quantity || 0} left
                      </p>
                    </div>
                  </div>
                ))
                ) : (
                  <div className="text-center py-6">
                    <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No low stock products</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All products are well stocked
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
