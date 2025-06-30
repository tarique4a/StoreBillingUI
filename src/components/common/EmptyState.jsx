import React from 'react';
import { 
  DocumentTextIcon,
  UsersIcon,
  CubeIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

const EmptyState = ({ 
  type = 'default',
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'customers':
        return UsersIcon;
      case 'products':
        return CubeIcon;
      case 'transactions':
        return DocumentTextIcon;
      case 'error':
        return ExclamationCircleIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getDefaultContent = () => {
    switch (type) {
      case 'customers':
        return {
          title: 'No customers found',
          description: 'Get started by creating your first customer.',
          actionText: 'Add Customer'
        };
      case 'products':
        return {
          title: 'No products found',
          description: 'Get started by adding products to your inventory.',
          actionText: 'Add Product'
        };
      case 'transactions':
        return {
          title: 'No transactions found',
          description: 'Start creating transactions to see them here.',
          actionText: 'Create Transaction'
        };
      case 'search':
        return {
          title: 'No results found',
          description: 'Try adjusting your search criteria.',
          actionText: null
        };
      case 'error':
        return {
          title: 'Something went wrong',
          description: 'We encountered an error while loading the data.',
          actionText: 'Try Again'
        };
      default:
        return {
          title: 'No data available',
          description: 'There is no data to display at the moment.',
          actionText: null
        };
    }
  };

  const Icon = getIcon();
  const defaultContent = getDefaultContent();
  
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;
  const finalActionText = actionText || defaultContent.actionText;

  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{finalTitle}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
        {finalDescription}
      </p>
      {finalActionText && onAction && (
        <div className="mt-6">
          <button
            type="button"
            className="btn-primary"
            onClick={onAction}
          >
            {finalActionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
