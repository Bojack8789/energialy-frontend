"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Nav from "../components/Nav";
import EditCompany from "./components/EditCompany";
import DatosBasicos from "./components/DatosBasicos";
import DetallesEmpresa from "./components/DetallesEmpresa";
import TipoOrganizacion from "./components/TipoOrganizacion";
import Imagenes from "./components/Imagenes";
import Colaboradores from "./components/Colaboradores";
import Suscripciones from "./components/Suscripciones";

const optionsNav = [
  "Datos Básicos",
  "Detalles de la Empresa",
  "Tipo de Organización",
  "Imágenes",
  "Agregar Colaboradores",
  "Suscripciones"
];

function PageProfileCompany() {
  const [selectedOption, setSelectedOption] = useState(0);

  const handleOptions = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className="bg-white flex flex-col md:flex-row min-h-full">
      <div className="w-full md:w-[160px] md:shrink-0 border-b md:border-b-0 md:border-r border-gray-200">
        <Nav options={optionsNav} onClick={handleOptions} />
      </div>
      <div className="flex-1 min-w-0">
        {selectedOption === 0 && <DatosBasicos />}
        {selectedOption === 1 && <DetallesEmpresa />}
        {selectedOption === 2 && <TipoOrganizacion />}
        {selectedOption === 3 && <Imagenes />}
        {selectedOption === 4 && <Colaboradores />}
        {selectedOption === 5 && <Suscripciones />}
      </div>
    </div>
  );
}

export default PageProfileCompany;
