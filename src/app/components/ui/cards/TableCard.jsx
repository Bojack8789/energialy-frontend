"use client";

import React from 'react';

const TableCard = ({ 
  title, 
  headers, 
  data, 
  loading = false,
  actions = null,
  emptyMessage = "No hay datos disponibles"
}) => {
  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h4>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-4 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          {title}
        </h4>
      </div>

      <div className="flex flex-col">
        <div className="grid rounded-sm bg-gray-2 dark:bg-meta-4" style={{ gridTemplateColumns: `repeat(${headers.length + (actions ? 1 : 0)}, minmax(0, 1fr))` }}>
          {headers.map((header, index) => (
            <div key={index} className="p-2.5 xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                {header}
              </h5>
            </div>
          ))}
          {actions && (
            <div className="p-2.5 xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Acciones
              </h5>
            </div>
          )}
        </div>

        {data.length === 0 ? (
          <div className="p-5 text-center text-meta-5 dark:text-meta-4">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid border-b border-stroke dark:border-strokedark"
              style={{ gridTemplateColumns: `repeat(${headers.length + (actions ? 1 : 0)}, minmax(0, 1fr))` }}
            >
              {Object.values(row).map((cell, cellIndex) => (
                <div key={cellIndex} className="flex items-center gap-3 p-2.5 xl:p-5">
                  <p className="text-black dark:text-white text-sm">
                    {cell}
                  </p>
                </div>
              ))}
              {actions && (
                <div className="flex items-center gap-3 p-2.5 xl:p-5">
                  {actions(row, rowIndex)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TableCard;
