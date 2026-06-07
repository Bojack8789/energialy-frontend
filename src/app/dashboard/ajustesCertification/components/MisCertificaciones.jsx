"use client";
import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";

import getLocalStorage from "@/app/Func/localStorage";
import { getCompanyId } from "@/app/Func/sessionStorage";

import FilesCardContainer from "./FilesCardContainer";
import ModalImage from "@/app/components/Modals/imageModal";

import {
  axiosGetCertificationCompanyById,
  axiosDeleteCertificationGalleryById,
  axiosEditCertificationGalleryById,
} from "@/app/Func/axios";

const MAX_FILES = 4;

export default function MisCertificaciones() {
  const [user, setUser] = useState(null);
  const [certification, setCertification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const u = getLocalStorage();
    setUser(u);
  }, []);

  const companyId = getCompanyId();

  useEffect(() => {
    if (companyId) {
      axiosGetCertificationCompanyById(companyId, (data) => {
        setCertification(data);
        setLoading(false);
      });
    }
  }, [companyId]);

  const openModal = (fileUrl) => {
    setSelectedFile(fileUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedFile(null);
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    await axiosDeleteCertificationGalleryById(id, setCertification);
  };

  const handleSaveDescription = async (id, newDescription) => {
    try {
      await axiosEditCertificationGalleryById(id, newDescription);
      setCertification((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, description: newDescription } : item
        )
      );
    } catch (error) {
      console.error("Error al actualizar la descripción:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <svg className="animate-spin w-8 h-8 text-[#191654]/40" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-gray-400">Cargando certificaciones...</span>
      </div>
    );
  }

  const count = certification?.length ?? 0;
  const isEmpty = !certification || count === 0;

  return (
    <div className="px-2 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mis Certificaciones / Homologaciones</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Documentos visibles en tu perfil de empresa y propuestas.
          </p>
        </div>

        {/* Slots ocupados */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 self-start sm:self-auto">
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_FILES }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full transition-colors ${
                  i < count ? "bg-[#191654]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
            {count}/{MAX_FILES}
          </span>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
          <div className="w-16 h-16 rounded-3xl bg-[#191654]/5 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#191654]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700">Sin certificaciones aún</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Agregá tus certificados e ISO para aumentar la confianza de tus clientes.
          </p>
        </div>
      ) : (
        <FilesCardContainer
          certification={certification}
          openModal={openModal}
          onDelete={handleDelete}
          onSaveDescription={handleSaveDescription}
        />
      )}

      {modalOpen && selectedFile && (
        <ModalImage imageUrl={selectedFile} onClose={closeModal} />
      )}
    </div>
  );
}
