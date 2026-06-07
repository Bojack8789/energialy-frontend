"use client";

import React from 'react';

const MetricsGrid = ({ metrics, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 dark:bg-gray-700"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 dark:bg-gray-700"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      {metrics.map((metric, index) => (
        <div key={index} className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            {metric.icon}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {metric.value}
              </h4>
              <span className="text-sm font-medium text-black dark:text-white">
                {metric.title}
              </span>
              {metric.subtitle && (
                <p className="text-xs text-meta-5 dark:text-meta-4 mt-1">
                  {metric.subtitle}
                </p>
              )}
            </div>

            {metric.change && (
              <span className={`flex items-center gap-1 text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-meta-3' : 'text-meta-1'
              }`}>
                {metric.change}
                <span className="text-xs">
                  {metric.changeType === 'positive' ? '↗' : '↘'}
                </span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
