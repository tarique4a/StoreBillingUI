import React, { useState } from 'react';
import { analyticsAPI, analyticsRequestBuilder } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const FlexibleAnalyticsDemo = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState('dashboard');

  const predefinedQueries = {
    dashboard: {
      name: 'Dashboard Analytics',
      request: analyticsRequestBuilder.presets.dashboard(),
    },
    salesTrends: {
      name: 'Daily Sales Trends',
      request: analyticsRequestBuilder.presets.salesTrends(null, 'DAY'),
    },
    topProducts: {
      name: 'Top 5 Products',
      request: analyticsRequestBuilder.presets.topProducts(5),
    },
    topCustomers: {
      name: 'Top 10 Customers',
      request: analyticsRequestBuilder.presets.topCustomers(10),
    },
    lowStock: {
      name: 'Low Stock Products',
      request: analyticsRequestBuilder.presets.lowStockProducts(10, 20),
    },
    transactionStatus: {
      name: 'Transactions by Status',
      request: analyticsRequestBuilder.presets.transactionsByStatus(),
    },
    customQuery: {
      name: 'Custom: High Value Transactions',
      request: analyticsRequestBuilder.createRequest('transaction', [
        analyticsRequestBuilder.aggregations.count('highValueCount'),
        analyticsRequestBuilder.aggregations.sum('highValueRevenue', 'totalAmount'),
        analyticsRequestBuilder.aggregations.average('averageValue', 'totalAmount'),
      ], [
        analyticsRequestBuilder.filters.excludeDrafted(),
        analyticsRequestBuilder.filters.greaterThan('totalAmount', 1000),
      ]),
    },
  };

  const executeQuery = async () => {
    try {
      setLoading(true);
      const query = predefinedQueries[selectedQuery];
      const response = await analyticsAPI.executeQuery(query.request);
      setResults({
        queryName: query.name,
        request: query.request,
        response: response.data,
      });
    } catch (error) {
      setResults({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value > 1000) {
        return value.toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2 
        });
      }
      return value.toString();
    }
    return JSON.stringify(value, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Flexible Analytics Demo</h2>
          <p className="text-sm text-gray-600">
            Test the new flexible analytics API with predefined queries
          </p>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-4 mb-4">
            {Object.entries(predefinedQueries).map(([key, query]) => (
              <button
                key={key}
                onClick={() => setSelectedQuery(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedQuery === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {query.name}
              </button>
            ))}
          </div>
          
          <button
            onClick={executeQuery}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Executing...' : 'Execute Query'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {results && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Request: {results.queryName}
              </h3>
            </div>
            <div className="card-body">
              <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto max-h-96">
                {JSON.stringify(results.request, null, 2)}
              </pre>
            </div>
          </div>

          {/* Response */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Response</h3>
              {results.response && (
                <p className="text-sm text-gray-600">
                  Executed in {results.response.executionTimeMs}ms
                </p>
              )}
            </div>
            <div className="card-body">
              {results.error ? (
                <div className="text-red-600 p-4 bg-red-50 rounded-md">
                  Error: {results.error}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Aggregations */}
                  {results.response.aggregations && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Aggregations</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {Object.entries(results.response.aggregations).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1">
                            <span className="font-medium">{key}:</span>
                            <span>{formatValue(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Data */}
                  {results.response.rawData && results.response.rawData.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Raw Data ({results.response.rawData.length} items)
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-auto">
                        <pre className="text-sm">
                          {JSON.stringify(results.response.rawData.slice(0, 3), null, 2)}
                          {results.response.rawData.length > 3 && '\n... and more'}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {results.response.metadata && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Metadata</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Total Count: {results.response.totalCount}</div>
                          <div>Execution Time: {results.response.executionTimeMs}ms</div>
                          <div>Filter Count: {results.response.metadata.filterCount}</div>
                          <div>Aggregation Count: {results.response.metadata.aggregationCount}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlexibleAnalyticsDemo;
