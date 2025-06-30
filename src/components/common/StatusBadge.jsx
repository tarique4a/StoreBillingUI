import React from 'react';
import { TRANSACTION_STATUS, CUSTOMER_TYPES } from '../../services/api';

const StatusBadge = ({ status, type = 'transaction' }) => {
  const getStatusConfig = () => {
    if (type === 'transaction') {
      switch (status) {
        case TRANSACTION_STATUS.DRAFTED:
          return { className: 'badge-gray', text: 'Draft' };
        case TRANSACTION_STATUS.CREATED:
          return { className: 'badge-primary', text: 'Created' };
        case TRANSACTION_STATUS.PARTIAL_PAID:
          return { className: 'badge-warning', text: 'Partial Paid' };
        case TRANSACTION_STATUS.CLOSED:
          return { className: 'badge-success', text: 'Closed' };
        case TRANSACTION_STATUS.RETURNED:
          return { className: 'badge-danger', text: 'Returned' };
        default:
          return { className: 'badge-gray', text: status };
      }
    }

    if (type === 'customer') {
      switch (status) {
        case CUSTOMER_TYPES.INDIVIDUAL:
          return { className: 'badge-primary', text: 'Individual' };
        case CUSTOMER_TYPES.BUSINESS:
          return { className: 'badge-success', text: 'Business' };
        default:
          return { className: 'badge-gray', text: status };
      }
    }

    if (type === 'stock') {
      const quantity = parseInt(status);
      if (quantity === 0) {
        return { className: 'badge-danger', text: 'Out of Stock' };
      } else if (quantity < 10) {
        return { className: 'badge-warning', text: 'Low Stock' };
      } else {
        return { className: 'badge-success', text: 'In Stock' };
      }
    }

    return { className: 'badge-gray', text: status };
  };

  const { className, text } = getStatusConfig();

  return <span className={`badge ${className}`}>{text}</span>;
};

export default StatusBadge;
