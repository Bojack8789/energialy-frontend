"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  displayFailedMessage,
  displaySuccessMessage,
} from "../../../components/Toastify";

import getLocalStorage from "@/app/Func/localStorage";
import { getCompanyId } from "@/app/Func/sessionStorage";

import {
  axiosPostCompanyGallery,
  axiosGetImageCount,
} from "@/app/Func/axios";

const MAX_FILES = 4;

export default function AgregarImagen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [galleryImage, setGalleryImage] = useState(null);
  const [galleryDescription, setGalleryDescription] = useState("");
  const [galleryError, setGalleryError] = useState("");
  const [imageCount, setImageCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = getLocalStorage();
    if (userData) setUser(userData);
  }, []);

  const companyId = getCompanyId();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await axiosGetImageCount(companyId);
        setImageCount(count);
      } catch (error) {
        console.error("Error al obtener el número de imágenes:", error);
      }
    };
    if (companyId) fetchCount();
  }, [companyId]);

  const isLimitReached = imageCount >= MAX_FILES;

  const validateAndSetFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      setGalleryError("Solo se aceptan imágenes (JPG, PNG, GIF, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setGalleryError("La imagen no puede superar los 10 MB.");
      return;
    }
    setGalleryError("");
    setGalleryImage(file);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (isLimitReached) return;
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    },
    [isLimitReached]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isLimitReached) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e) => {
    validateAndSetFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!galleryImage) {
      setGalleryError("Debes seleccionar una imagen.");
      return;
    }
    if (!galleryDescription.trim()) {
      setGalleryError("Debes proporcionar una descripción.");
      return;
    }
    setLoading(true);
    setGalleryError("");
    try {
      await axiosPostCompanyGallery(galleryDescription, companyId, [galleryImage]);
      displaySuccessMessage("Imagen cargada con éxito");
      setImageCount((prev) => prev + 1);
      setGalleryImage(null);
      setGalleryDescription("");
    } catch (error) {
      console.error("Error al cargar imagen:", error);
      setGalleryError("Error al cargar la imagen. Intentá nuevamente.");
      displayFailedMessage("Error al cargar la imagen");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setGalleryImage(null);
    setGalleryDescription("");
    setGalleryError("");
  };

  const previewUrl = galleryImage ? URL.createObjectURL(galleryImage) : null;

  return (
    <div className="max-w-2xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Agregar Producto / Servicio</h2>
        <p className="text-sm text-gray-500 mt-1">
          Mostrá tus productos y servicios con imágenes atractivas en tu perfil de empresa.
        </p>

        {/* Contador */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_FILES }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1.5 rounded-full transition-colors ${
                  i < imageCount ? "bg-[#191654]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {imageCount}/{MAX_FILES} imágenes cargadas
          </span>
        </div>
      </div>

      {isLimitReached ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <p className="font-semibold text-amber-800">Límite alcanzado</p>
          <p className="text-sm text-amber-600 mt-1">
            Ya tienes {MAX_FILES} imágenes cargadas. Eliminá una para poder agregar otra.
          </p>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="space-y-5">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 text-center
              ${isDragging ? "border-[#191654] bg-[#191654]/5 scale-[1.01]" : "border-gray-200 bg-gray-50 hover:border-[#191654]/40 hover:bg-[#191654]/5"}
              ${galleryImage ? "border-emerald-300 bg-emerald-50" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            {galleryImage ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{galleryImage.name}</p>
                  <p className="text-xs text-gray-500">{(galleryImage.size / 1024).toFixed(1)} KB · Clic para cambiar</p>
                </div>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Imagen lista
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-[#191654]/10" : "bg-gray-100"}`}>
                  <svg className={`w-7 h-7 transition-colors ${isDragging ? "text-[#191654]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    {isDragging ? "Soltá la imagen aquí" : "Arrastrá o hacé clic para cargar"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP · Máximo 10 MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Descripción <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={galleryDescription}
              onChange={(e) => setGalleryDescription(e.target.value)}
              placeholder="Ej: Panel solar monocristalino 400W"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#191654]/25 focus:border-[#191654] transition placeholder-gray-400"
              maxLength={120}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{galleryDescription.length}/120</p>
          </div>

          {/* Error */}
          {galleryError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {galleryError}
            </div>
          )}

          {/* Preview expandida */}
          {galleryImage && previewUrl && (
            <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full max-h-64 object-contain"
              />
              {galleryDescription && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700 font-medium">{galleryDescription}</p>
                </div>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            {galleryImage && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !galleryImage}
              className="flex-1 py-3 rounded-xl bg-[#191654] text-sm font-semibold text-white hover:bg-[#191654]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Cargar imagen
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <ToastContainer style={{ marginTop: "100px" }} />
    </div>
  );
}
