"use client";
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import Nav from "../components/Nav";
import MisImagenes from "./components/MisImagenes";
import AgregarImagen from "./components/AgregarImagen";

const optionsNav = [
  "Mis Productos/Servicios",
  "Agregar Productos/Servicios",
];

function PageProfileGallery() {
  const [selectedOption, setSelectedOption] = useState(0);

  const handleOptions = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className="w-full bg-white flex flex-col md:flex-row shadow min-h-screen">
      <div className="w-full md:w-1/4 md:min-w-[200px] md:max-w-[260px] border-b md:border-b-0 md:border-r border-gray-200">
        <Nav options={optionsNav} onClick={handleOptions} />
      </div>
      <div className="flex-1 p-4 sm:p-6 min-w-0">
        {selectedOption === 0 && <MisImagenes />}
        {selectedOption === 1 && <AgregarImagen />}
      </div>
    </div>
  );
}

export default PageProfileGallery;
