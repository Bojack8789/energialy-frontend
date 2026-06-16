"use client";

import React, { useState } from 'react';

const TableCard = ({ 
  title, 
  data = [], 
  columns = [],
  className = "",
  showSearch = true,
  showFilter = true,
  searchPlaceholder = "Search...",
  onRowClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredData = (data || []).filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Complete': 'bg-meta-3 text-white',
      'Pending': 'bg-warning text-white',
      'Active': 'bg-meta-3 text-white',
      'Inactive': 'bg-meta-1 text-white'
    };
    
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const renderCellContent = (value, column, row) => {
    // If column has a custom render function, use it
    if (column.render) {
      return column.render(row);
    }
    if (column.type === 'status') {
      return getStatusBadge(value);
    }
    if (column.type === 'avatar') {
      return (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <span>{value}</span>
        </div>
      );
    }
    return value;
  };

  return (
    <div className={`rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ${className}`}>
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            {showSearch && (
              <div className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border border-stroke bg-gray py-2 pl-10 pr-4 text-sm text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                />
                <span className="absolute left-3 top-2.5">
                  <svg
                    className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                      fill=""
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                      fill=""
                    />
                  </svg>
                </span>
              </div>
            )}
            
            {showFilter && (
              <button className="flex items-center gap-2 rounded bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-90">
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 3C3 2.44772 3.44772 2 4 2H16C16.5523 2 17 2.44772 17 3C17 3.55228 16.5523 4 16 4H4C3.44772 4 3 3.55228 3 3ZM6 8C6 7.44772 6.44772 7 7 7H13C13.5523 7 14 7.44772 14 8C14 8.55228 13.5523 9 13 9H7C6.44772 9 6 8.55228 6 8ZM9 13C9 12.4477 9.44772 12 10 12C10.5523 12 11 12.4477 11 13C11 13.5523 10.5523 14 10 14C9.44772 14 9 13.5523 9 13Z"
                    fill=""
                  />
                </svg>
                Filter
              </button>
            )}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                {columns && columns.length > 0 && columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-white whitespace-nowrap"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData && paginatedData.length > 0 && paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-2 dark:hover:bg-meta-4 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns && columns.length > 0 && columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="border-b border-[#eee] px-4 py-3 dark:border-strokedark text-sm"
                    >
                      {renderCellContent(row[column.accessor], column, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length} resultados
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableCard;
