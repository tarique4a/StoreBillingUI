import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CubeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { analyticsAPI, analyticsRequestBuilder, formatCurrency } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DateRangePicker from '../components/common/DateRangePicker';
import FlexibleAnalyticsDemo from '../components/analytics/FlexibleAnalyticsDemo';

const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

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

  if (loading) {
    return <LoadingSpinner />;
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
                    {analytics.transactionsByStatus.map((status) => (
                      <div key={status.transactionStatus} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">
                          {status.transactionStatus.toLowerCase().replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {status.transactionsByStatus}
                        </span>
                      </div>
                    ))}
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
              {analytics.executionTimes.map((metric) => (
                <div key={metric.query} className="text-center">
                  <p className="text-sm text-gray-600 capitalize">{metric.query}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {metric.time ? `${metric.time}ms` : 'Failed'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
