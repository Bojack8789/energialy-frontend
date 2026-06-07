"use client";
import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";

import getLocalStorage from "@/app/Func/localStorage";
import { getCompanyId } from "@/app/Func/sessionStorage";

import FilesCardContainer from "./FilesCardContainer";
import ModalImage from "@/app/components/Modals/imageModal";

import {
  axiosGetGalleryCompanyById,
  axiosDeleteCompanyGalleryById,
  axiosEditCompanyGalleryById,
} from "@/app/Func/axios";

const MAX_FILES = 4;

export default function MisImagenes() {
  const [user, setUser] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const u = getLocalStorage();
    setUser(u);
  }, []);

  const companyId = getCompanyId();

  useEffect(() => {
    if (companyId) {
      axiosGetGalleryCompanyById(companyId, (data) => {
        setGallery(data);
        setLoading(false);
      });
    }
  }, [companyId]);

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    await axiosDeleteCompanyGalleryById(id, setGallery);
  };

  const handleSaveDescription = async (id, newDescription) => {
    try {
      await axiosEditCompanyGalleryById(id, newDescription);
      setGallery((prev) =>
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
        <span className="text-sm text-gray-400">Cargando productos/servicios...</span>
      </div>
    );
  }

  const count = gallery?.length ?? 0;
  const isEmpty = !gallery || count === 0;

  return (
    <div className="px-2 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mis Productos / Servicios</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Imágenes de tus productos y servicios visibles en tu perfil y propuestas.
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700">Sin imágenes aún</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Agregá imágenes de tus productos y servicios para destacarte frente a otros proveedores.
          </p>
        </div>
      ) : (
        <FilesCardContainer
          gallery={gallery}
          openModal={openModal}
          onDelete={handleDelete}
          onSaveDescription={handleSaveDescription}
        />
      )}

      {modalOpen && selectedImage && (
        <ModalImage imageUrl={selectedImage} onClose={closeModal} />
      )}
    </div>
  );
}
