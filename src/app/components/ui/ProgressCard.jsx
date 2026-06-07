"use client";

import React from 'react';

const ProgressCard = ({ 
  title, 
  subtitle,
  percentage, 
  targetValue,
  currentValue,
  todayValue,
  className = "",
  size = "lg" // "sm" | "md" | "lg"
}) => {
  const sizeClasses = {
    sm: "h-24 w-24",
    md: "h-32 w-32", 
    lg: "h-40 w-40"
  };

  const strokeWidth = size === "sm" ? 8 : size === "md" ? 10 : 12;
  const radius = size === "sm" ? 40 : size === "md" ? 54 : 68;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <h5 className="text-xl font-semibold text-black dark:text-white text-center">
            {title}
          </h5>
          {subtitle && (
            <p className="text-sm text-body text-center mt-1">{subtitle}</p>
          )}
        </div>

        <div className="relative mb-6">
          <svg
            className={`${sizeClasses[size]} transform -rotate-90`}
            width={radius * 2}
            height={radius * 2}
          >
            {/* Background circle */}
            <circle
              stroke="currentColor"
              className="text-stroke dark:text-strokedark"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress circle */}
            <circle
              stroke="#3C50E0"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-black dark:text-white">
              {percentage}%
            </span>
            <span className="text-xs text-meta-3 mt-1">+10%</span>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-body mb-2">
            You earn ${currentValue} today, it's higher than last month.
          </p>
          <p className="text-sm text-body">
            Keep up your good work!
          </p>
        </div>

        {/* Stats row */}
        <div className="flex w-full justify-between border-t border-stroke pt-4 dark:border-strokedark">
          <div className="text-center">
            <p className="text-sm text-body">Target</p>
            <p className="text-lg font-semibold text-black dark:text-white">
              ${targetValue}
              <span className="text-meta-1 text-xs ml-1">↓</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-body">Revenue</p>
            <p className="text-lg font-semibold text-black dark:text-white">
              ${currentValue}
              <span className="text-meta-3 text-xs ml-1">↑</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-body">Today</p>
            <p className="text-lg font-semibold text-black dark:text-white">
              ${todayValue}
              <span className="text-meta-3 text-xs ml-1">↑</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
