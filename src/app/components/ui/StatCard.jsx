"use client";

import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  percentage, 
  percentageColor = 'text-meta-3', 
  icon,
  trend = 'up' // 'up' | 'down'
}) => {
  const trendColor = trend === 'up' ? 'text-meta-3' : 'text-meta-1';
  const trendIcon = trend === 'up' ? '↗' : '↘';

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
          <span className="text-sm font-medium">{title}</span>
        </div>

        {percentage && (
          <span className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            {percentage}
            <span className="text-xs">{trendIcon}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
