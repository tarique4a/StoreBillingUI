import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CubeIcon,
  ClockIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { analyticsAPI, analyticsRequestBuilder, formatCurrency } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DateRangePicker from '../components/common/DateRangePicker';
import FlexibleAnalyticsDemo from '../components/analytics/FlexibleAnalyticsDemo';

const AdvancedAnalytics = () => {
  const { isAuthenticated } = useAuth();
  const { currentShop, loading: shopLoading } = useShop();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Execute multiple analytics queries in parallel
      const queries = await Promise.allSettled([
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.dashboard(dateRange)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.transactionsByStatus(dateRange)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.topProducts(10, dateRange)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.topCustomers(10, dateRange)),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.salesTrends(dateRange, 'DAY')),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.salesTrends(dateRange, 'MONTH')),
        analyticsAPI.executeQuery(analyticsRequestBuilder.presets.lowStockProducts(10, 20)),
      ]);

      // Process results
      const [
        dashboardResult,
        statusResult,
        topProductsResult,
        topCustomersResult,
        dailySalesResult,
        monthlySalesResult,
        lowStockResult,
      ] = queries.map(result => result.status === 'fulfilled' ? result.value.data : null);

      // Combine analytics data
      const combinedAnalytics = {
        // Dashboard metrics
        totalRevenue: dashboardResult?.aggregations?.totalRevenue || 0,
        totalPaidAmount: dashboardResult?.aggregations?.totalPaidAmount || 0,
        totalDueAmount: (dashboardResult?.aggregations?.totalRevenue || 0) - (dashboardResult?.aggregations?.totalPaidAmount || 0),
        totalTransactions: dashboardResult?.aggregations?.totalTransactions || 0,
        
        // Status breakdown
        transactionsByStatus: statusResult?.aggregations?.transactionsByStatus || [],
        
        // Top performers
        topSellingProducts: topProductsResult?.aggregations?.topProducts || [],
        topCustomers: topCustomersResult?.aggregations?.topCustomers || [],
        
        // Trends
        dailySales: dailySalesResult?.aggregations?.salesTrend || [],
        monthlySales: monthlySalesResult?.aggregations?.salesTrend || [],
        
        // Inventory
        lowStockProducts: lowStockResult?.rawData || [],
        lowStockCount: lowStockResult?.aggregations?.lowStockCount || 0,
        
        // Metadata
        executionTimes: queries.map((result, index) => ({
          query: ['dashboard', 'status', 'topProducts', 'topCustomers', 'dailySales', 'monthlySales', 'lowStock'][index],
          time: result.status === 'fulfilled' ? result.value.data.executionTimeMs : null,
        })),
      };
      
      setAnalytics(combinedAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError(error.message || 'Failed to load analytics data');
      // Set default empty analytics
      setAnalytics({
        totalRevenue: 0,
        totalPaidAmount: 0,
        totalDueAmount: 0,
        totalTransactions: 0,
        transactionsByStatus: [],
        topSellingProducts: [],
        topCustomers: [],
        dailySales: [],
        monthlySales: [],
        lowStockProducts: [],
        lowStockCount: 0,
        executionTimes: [],
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    // Only load data when user is authenticated and shop is selected
    if (isAuthenticated && currentShop && !shopLoading) {
      loadAnalytics();
    } else if (isAuthenticated && !shopLoading && !currentShop) {
      // User is authenticated but no shop selected
      setLoading(false);
    }
  }, [loadAnalytics, isAuthenticated, currentShop, shopLoading]);

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'trends', name: 'Trends', icon: ArrowTrendingUpIcon },
    { id: 'products', name: 'Products', icon: CubeIcon },
    { id: 'customers', name: 'Customers', icon: UsersIcon },
    { id: 'demo', name: 'API Demo', icon: ClockIcon },
  ];

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
          Create or select a shop to view analytics
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Advanced Analytics</h1>
          <p className="text-gray-600">Powered by the new flexible analytics API</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="card-body">
          <DateRangePicker onDateRangeChange={handleDateRangeChange} />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {analytics && (
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                          {formatCurrency(analytics.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(analytics.totalPaidAmount)}
                        </p>
                      </div>
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
                          {formatCurrency(analytics.totalDueAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <ChartBarIcon className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Transactions</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {analytics.totalTransactions}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Status Breakdown */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">Transaction Status</h2>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {analytics.transactionsByStatus && analytics.transactionsByStatus.length > 0 ? (
                      analytics.transactionsByStatus.map((status) => (
                        <div key={status.transactionStatus || Math.random()} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">
                            {status.transactionStatus ? status.transactionStatus.toLowerCase().replace('_', ' ') : 'Unknown Status'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {status.transactionsByStatus || 0}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No transaction data</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Transaction status breakdown will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demo' && <FlexibleAnalyticsDemo />}

          {/* Other tabs can be implemented similarly */}
          {activeTab !== 'overview' && activeTab !== 'demo' && (
            <div className="card">
              <div className="card-body">
                <p className="text-gray-500 text-center py-8">
                  {tabs.find(t => t.id === activeTab)?.name} content coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics */}
      {analytics && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Query Performance</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.executionTimes && analytics.executionTimes.length > 0 ? (
                analytics.executionTimes.map((metric) => (
                  <div key={metric.query || Math.random()} className="text-center">
                    <p className="text-sm text-gray-600 capitalize">{metric.query || 'Unknown'}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {metric.time ? `${metric.time}ms` : 'Failed'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No performance data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Query execution times will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
