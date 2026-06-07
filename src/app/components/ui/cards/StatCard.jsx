"use client";

import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  subtitle,
  loading = false 
}) => {
  const changeColor = changeType === 'positive' ? 'text-meta-3' : 'text-meta-1';
  const changeIcon = changeType === 'positive' ? '↗' : '↘';

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 dark:bg-gray-700"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 dark:bg-gray-700"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        {icon}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {value}
          </h4>
          <span className="text-sm font-medium text-black dark:text-white">
            {title}
          </span>
          {subtitle && (
            <p className="text-xs text-meta-5 dark:text-meta-4 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {change && (
          <span className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
            {change}
            <span className="text-xs">{changeIcon}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
