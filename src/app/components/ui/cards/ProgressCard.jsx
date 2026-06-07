"use client";

import React from 'react';

const ProgressCard = ({ 
  title, 
  percentage, 
  value, 
  total,
  color = '#3C50E0',
  size = 120,
  strokeWidth = 8,
  loading = false
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 dark:bg-gray-700"></div>
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          {title}
        </h4>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            className="transform -rotate-90"
            width={size}
            height={size}
          >
            {/* Background circle */}
            <circle
              stroke="#e6e6e6"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            {/* Progress circle */}
            <circle
              stroke={color}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={radius}
              cx={size / 2}
              cy={size / 2}
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-black dark:text-white">
              {percentage}%
            </span>
            {value !== undefined && total !== undefined && (
              <span className="text-sm text-meta-5 dark:text-meta-4">
                {value}/{total}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-meta-5 dark:text-meta-4">
            Progreso actual
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
