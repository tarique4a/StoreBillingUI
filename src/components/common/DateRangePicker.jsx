import React, { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

const DateRangePicker = ({ onDateRangeChange, className = '' }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (newStartDate && endDate) {
      onDateRangeChange({
        startDate: new Date(newStartDate).getTime(),
        endDate: new Date(endDate).getTime(),
      });
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    if (startDate && newEndDate) {
      onDateRangeChange({
        startDate: new Date(startDate).getTime(),
        endDate: new Date(newEndDate).getTime(),
      });
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange(null);
  };

  const setPresetRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    
    onDateRangeChange({
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    });
  };

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="input-field text-sm"
          placeholder="Start Date"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="input-field text-sm"
          placeholder="End Date"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setPresetRange(7)}
          className="btn-secondary text-sm py-1 px-3"
        >
          Last 7 days
        </button>
        <button
          onClick={() => setPresetRange(30)}
          className="btn-secondary text-sm py-1 px-3"
        >
          Last 30 days
        </button>
        <button
          onClick={() => setPresetRange(90)}
          className="btn-secondary text-sm py-1 px-3"
        >
          Last 90 days
        </button>
        {(startDate || endDate) && (
          <button
            onClick={handleClear}
            className="btn-outline text-sm py-1 px-3"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
