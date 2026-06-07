"use client";

import React from 'react';

const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { value: 7, label: '7 días' },
    { value: 30, label: '30 días' },
    { value: 90, label: '90 días' },
  ];

  return (
    <div className="inline-flex rounded-lg shadow-sm overflow-hidden" role="group">
      {periods.map((period, index) => (
        <button
          key={period.value}
          type="button"
          onClick={() => onPeriodChange(period.value)}
          className={`
            px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border-r last:border-r-0
            ${
              selectedPeriod === period.value
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-boxdark dark:text-white dark:hover:bg-meta-4'
            }
            transition-all duration-200 whitespace-nowrap
          `}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;
