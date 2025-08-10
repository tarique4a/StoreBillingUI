/**
 * Filter configuration for different entities
 * Defines available fields, types, and operations for filtering
 */

import { SEARCH_OPERATIONS } from '../services/api';

// Field types for different input components
export const FILTER_FIELD_TYPES = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  SELECT: 'SELECT',
  DATE: 'DATE',
  BOOLEAN: 'BOOLEAN'
};

// Available operations for each field type
export const FIELD_OPERATIONS = {
  [FILTER_FIELD_TYPES.TEXT]: [
    { value: SEARCH_OPERATIONS.CONTAINS, label: 'Contains' },
    { value: SEARCH_OPERATIONS.EQUALITY, label: 'Equals' },
    { value: SEARCH_OPERATIONS.STARTS_WITH, label: 'Starts with' },
    { value: SEARCH_OPERATIONS.ENDS_WITH, label: 'Ends with' },
    { value: SEARCH_OPERATIONS.NEGATION, label: 'Does not equal' }
  ],
  [FILTER_FIELD_TYPES.NUMBER]: [
    { value: SEARCH_OPERATIONS.EQUALITY, label: 'Equals' },
    { value: SEARCH_OPERATIONS.NEGATION, label: 'Does not equal' },
    { value: SEARCH_OPERATIONS.GREATER_THAN, label: 'Greater than' },
    { value: SEARCH_OPERATIONS.LESS_THAN, label: 'Less than' }
  ],
  [FILTER_FIELD_TYPES.SELECT]: [
    { value: SEARCH_OPERATIONS.EQUALITY, label: 'Equals' },
    { value: SEARCH_OPERATIONS.NEGATION, label: 'Does not equal' }
  ],
  [FILTER_FIELD_TYPES.DATE]: [
    { value: SEARCH_OPERATIONS.EQUALITY, label: 'On date' },
    { value: SEARCH_OPERATIONS.GREATER_THAN, label: 'After' },
    { value: SEARCH_OPERATIONS.LESS_THAN, label: 'Before' }
  ],
  [FILTER_FIELD_TYPES.BOOLEAN]: [
    { value: SEARCH_OPERATIONS.EQUALITY, label: 'Is' }
  ]
};

// Helper function to create filter field configuration
export const createFilterField = (key, label, type, options = null) => ({
  key,
  label,
  type,
  options,
  operations: FIELD_OPERATIONS[type] || []
});

// Customer filter configuration
export const CUSTOMER_FILTER_FIELDS = [
  createFilterField('name', 'Name', FILTER_FIELD_TYPES.TEXT),
  createFilterField('email', 'Email', FILTER_FIELD_TYPES.TEXT),
  createFilterField('phoneNo', 'Phone Number', FILTER_FIELD_TYPES.TEXT),
  createFilterField('address', 'Address', FILTER_FIELD_TYPES.TEXT),
  createFilterField('city', 'City', FILTER_FIELD_TYPES.TEXT),
  createFilterField('customerType', 'Customer Type', FILTER_FIELD_TYPES.SELECT, [
    { value: 'INDIVIDUAL', label: 'Individual' },
    { value: 'BUSINESS', label: 'Business' }
  ])
];

export const CUSTOMER_SEARCH_FIELDS = ['name', 'email', 'phoneNo'];

// Product filter configuration
export const PRODUCT_FILTER_FIELDS = [
  createFilterField('name', 'Product Name', FILTER_FIELD_TYPES.TEXT),
  createFilterField('brand', 'Brand', FILTER_FIELD_TYPES.TEXT),
  createFilterField('category', 'Category', FILTER_FIELD_TYPES.TEXT),
  createFilterField('quantity', 'Quantity', FILTER_FIELD_TYPES.NUMBER),
  createFilterField('unitSalePrice', 'Unit Sale Price', FILTER_FIELD_TYPES.NUMBER),
  createFilterField('unitCostPrice', 'Unit Cost Price', FILTER_FIELD_TYPES.NUMBER),
  createFilterField('mrp', 'MRP', FILTER_FIELD_TYPES.NUMBER),
  createFilterField('createdTime', 'Created Date', FILTER_FIELD_TYPES.DATE),
  createFilterField('lastModifiedTime', 'Last Modified', FILTER_FIELD_TYPES.DATE)
];

export const PRODUCT_SEARCH_FIELDS = ['name', 'brand', 'category'];

// Transaction filter configuration
export const TRANSACTION_FILTER_FIELDS = [
  createFilterField('transactionId', 'Transaction ID', FILTER_FIELD_TYPES.TEXT),
  createFilterField('customerName', 'Customer Name', FILTER_FIELD_TYPES.TEXT),
  createFilterField('totalAmount', 'Total Amount', FILTER_FIELD_TYPES.NUMBER),
  createFilterField('status', 'Status', FILTER_FIELD_TYPES.SELECT, [
    { value: 'DRAFTED', label: 'Drafted' },
    { value: 'CREATED', label: 'Created' },
    { value: 'PARTIAL_PAID', label: 'Partial Paid' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'RETURNED', label: 'Returned' }
  ])
];

export const TRANSACTION_SEARCH_FIELDS = ['transactionId', 'customerName'];
