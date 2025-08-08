import React, { memo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FILTER_FIELD_TYPES } from '../../config/filterConfigs';

const FilterCondition = ({ 
  condition, 
  availableFields, 
  onChange, 
  onRemove, 
  showRemove = true 
}) => {
  const selectedField = availableFields.find(field => field.key === condition.field);
  
  const handleFieldChange = (fieldKey) => {
    const field = availableFields.find(f => f.key === fieldKey);
    onChange({
      ...condition,
      field: fieldKey,
      operator: field?.operations[0]?.value || '',
      value: ''
    });
  };

  const handleOperatorChange = (operator) => {
    onChange({
      ...condition,
      operator,
      value: condition.value
    });
  };

  const handleValueChange = (value) => {
    onChange({
      ...condition,
      value
    });
  };

  const renderValueInput = () => {
    if (!selectedField) return null;

    const commonProps = {
      value: condition.value || '',
      onChange: (e) => handleValueChange(e.target.value),
      className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
    };

    switch (selectedField.type) {
      case FILTER_FIELD_TYPES.TEXT:
        return (
          <input
            type="text"
            placeholder="Enter value..."
            {...commonProps}
          />
        );

      case FILTER_FIELD_TYPES.NUMBER:
        return (
          <input
            type="number"
            placeholder="Enter number..."
            {...commonProps}
          />
        );

      case FILTER_FIELD_TYPES.SELECT:
        return (
          <select {...commonProps}>
            <option value="">Select value...</option>
            {selectedField.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case FILTER_FIELD_TYPES.DATE:
        return (
          <input
            type="date"
            {...commonProps}
          />
        );

      case FILTER_FIELD_TYPES.BOOLEAN:
        return (
          <select {...commonProps}>
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );

      default:
        return (
          <input
            type="text"
            placeholder="Enter value..."
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {/* Field Selector */}
      <div className="flex-1">
        <select
          value={condition.field || ''}
          onChange={(e) => handleFieldChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="">Select field...</option>
          {availableFields.map(field => (
            <option key={field.key} value={field.key}>
              {field.label}
            </option>
          ))}
        </select>
      </div>

      {/* Operator Selector */}
      <div className="flex-1">
        <select
          value={condition.operator || ''}
          onChange={(e) => handleOperatorChange(e.target.value)}
          disabled={!selectedField}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100"
        >
          <option value="">Select operation...</option>
          {selectedField?.operations.map(op => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Value Input */}
      <div className="flex-1">
        {renderValueInput()}
      </div>

      {/* Remove Button */}
      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove condition"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default memo(FilterCondition);
