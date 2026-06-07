import CertificationCardContainer from '@/app/components/Modals/CertificationCardContainer';
import ModalFile from '@/app/components/Modals/certificationModal';
import React, { useState } from "react";
const CertificationCompany = ({ certification }) => {

//modal
const [modalOpen, setModalOpen] = useState(false); 
const [selectedFile, setSelectedFile] = useState(null); 

// Función para abrir el modal y establecer el file seleccionad
const openModal = (filesUrl) => {
  setSelectedFile(filesUrl);
  setModalOpen(true);
};

// Función para cerrar el modal
const closeModal = () => {
  setSelectedFile(null);
  setModalOpen(false);
};
//modal

if (certification == null) {
  return (
    <div className="certification flex flex-col bg-white m-4 rounded-md p-3 justify-between">
      <div className="text-center text-gray-500">La compañía no posee Certificaciones/Homologaciones</div>
    </div>
  );
}

  return (

<div className="certification flex flex-col bg-white m-4 rounded-md p-3 justify-between">
  {certification.length > 0 ? (
    <div className="mt-8 mb-0">
      <div className="flex flex-wrap justify-center">
        <CertificationCardContainer certification={certification} openModal={openModal} />
      </div>
    </div>
  ) : (
    <div>Cargando Certificaciones/Homologaciones...</div>
  )}
  {modalOpen && selectedFile && ( 
        <ModalFile filesUrl={selectedFile} onClose={closeModal} /> 
      )}
</div>
  );
};

export default CertificationCompany;