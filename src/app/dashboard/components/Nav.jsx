'use client'
import React, { useState } from 'react';
import EditCompany from '../ajustesEmpresa/components/EditCompany';

export default function Nav({ options, onClick }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleItemClick = (option, index) => {
    onClick(index);
    setSelectedOption(index);
  }

  return (
    <div className="w-full bg-[#fcfcfc]">
      <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
        {options.map((option, index) => (
          <div key={index} className="flex-shrink-0 md:flex-shrink">
            <div
              className={`block no-underline font-semibold text-gray-600 pl-4 pr-4 md:pl-5 py-3 transition duration-300 whitespace-nowrap md:whitespace-normal cursor-pointer text-sm sm:text-base ${
                selectedOption === index
                  ? 'border-b-2 md:border-b-0 md:border-l-4 border-[#191654] bg-white text-[#191654]'
                  : 'hover:border-b-2 md:hover:border-b-0 md:hover:border-l-4 hover:border-[#191654] hover:bg-white hover:text-[#191654]'
              }`}
              onClick={() => handleItemClick(option, index)}
            >
              {option}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
