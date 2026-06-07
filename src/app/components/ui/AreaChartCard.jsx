"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const AreaChartCard = ({ 
  title, 
  subtitle,
  data, 
  dataKey, 
  className = "",
  height = 350,
  showTooltip = true,
  areaColor = "#3C50E0",
  strokeColor = "#3C50E0",
  fillOpacity = 0.3,
  showTabs = false,
  tabs = []
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-sm border border-stroke bg-white p-1.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <p className="text-sm font-medium text-black dark:text-white">
            {`${label}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <div className="w-full">
              <p className="font-semibold text-black dark:text-white text-xl mb-2">{title}</p>
              {subtitle && (
                <p className="text-sm font-medium text-body">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {showTabs && tabs.length > 0 && (
          <div className="flex w-full max-w-45 justify-end">
            <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className={`rounded px-3 py-1 text-xs font-medium ${
                    tab.active 
                      ? 'bg-white text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white' 
                      : 'text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748B' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748B' }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={areaColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={areaColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              fillOpacity={1}
              fill="url(#colorGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AreaChartCard;
