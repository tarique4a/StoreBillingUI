import React, { useCallback, memo } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FilterCondition from './FilterCondition';

// Generate unique IDs more efficiently
let idCounter = 0;
const generateId = () => `condition_${++idCounter}_${Date.now()}`;

const FilterGroup = ({ 
  group, 
  availableFields, 
  onChange, 
  onRemove, 
  showRemove = true 
}) => {
  const addCondition = useCallback(() => {
    const newCondition = {
      id: generateId(),
      field: '',
      operator: '',
      value: ''
    };

    onChange({
      ...group,
      conditions: [...group.conditions, newCondition]
    });
  }, [group, onChange]);

  const updateCondition = useCallback((conditionId, updatedCondition) => {
    onChange({
      ...group,
      conditions: group.conditions.map(condition =>
        condition.id === conditionId ? updatedCondition : condition
      )
    });
  }, [group, onChange]);

  const removeCondition = useCallback((conditionId) => {
    onChange({
      ...group,
      conditions: group.conditions.filter(condition => condition.id !== conditionId)
    });
  }, [group, onChange]);

  const handleLogicChange = useCallback((logic) => {
    onChange({
      ...group,
      logic
    });
  }, [group, onChange]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Filter Group</span>
          {group.conditions.length > 1 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Match:</span>
              <select
                value={group.logic || 'AND'}
                onChange={(e) => handleLogicChange(e.target.value)}
                className="text-xs border-gray-300 rounded px-2 py-1 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="AND">All conditions (AND)</option>
                <option value="OR">Any condition (OR)</option>
              </select>
            </div>
          )}
        </div>
        
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove group"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        {group.conditions.map((condition, index) => (
          <div key={condition.id}>
            {index > 0 && (
              <div className="flex justify-center py-2">
                <span className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded">
                  {group.logic || 'AND'}
                </span>
              </div>
            )}
            <FilterCondition
              condition={condition}
              availableFields={availableFields}
              onChange={(updatedCondition) => updateCondition(condition.id, updatedCondition)}
              onRemove={() => removeCondition(condition.id)}
              showRemove={group.conditions.length > 1}
            />
          </div>
        ))}
      </div>

      {/* Add Condition Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={addCondition}
          className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add condition</span>
        </button>
      </div>
    </div>
  );
};

export default memo(FilterGroup);
