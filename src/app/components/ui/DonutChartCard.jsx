"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  primary: '#3C50E0',
  secondary: '#80CAEE', 
  success: '#10B981',
  warning: '#FFA70B',
  danger: '#F87171'
};

const DonutChartCard = ({ 
  title, 
  data, 
  centerValue,
  centerLabel,
  className = "",
  height = 350,
  showLegend = true
}) => {
  const getColor = (index) => {
    const colorKeys = Object.keys(COLORS);
    return COLORS[colorKeys[index % colorKeys.length]];
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-sm border border-stroke bg-white p-1.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <p className="text-sm font-medium text-black dark:text-white">
            {`${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = () => {
    if (centerValue && centerLabel) {
      return (
        <text 
          x="50%" 
          y="45%" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className="fill-current text-2xl font-bold text-black dark:text-white"
        >
          {centerValue}
        </text>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ${className}`}>
      <div className="mb-3">
        <h5 className="text-xl font-semibold text-black dark:text-white">
          {title}
        </h5>
      </div>

      <div className="mb-2">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {renderCustomizedLabel()}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="w-full px-8 sm:w-1/2">
              <div className="flex w-full items-center">
                <span 
                  className="mr-2 block h-3 w-full max-w-3 rounded-full"
                  style={{ backgroundColor: getColor(index) }}
                ></span>
                <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                  <span>{item.name}</span>
                  <span>{item.value}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {centerLabel && (
        <div className="text-center mt-4">
          <p className="text-sm text-black dark:text-white">{centerLabel}</p>
        </div>
      )}
    </div>
  );
};

export default DonutChartCard;
