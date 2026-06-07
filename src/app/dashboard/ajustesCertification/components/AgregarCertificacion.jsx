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
  axiosPostCertificationGallery,
  axiosGetCertificationCount,
} from "@/app/Func/axios";

const MAX_FILES = 4;

export default function AgregarCertificacion() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [certificationFile, setCertificationFile] = useState(null);
  const [certificationDescription, setCertificationDescription] = useState("");
  const [certificationError, setCertificationError] = useState("");
  const [fileCount, setFileCount] = useState(0);
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
        const count = await axiosGetCertificationCount(companyId);
        setFileCount(count);
      } catch (error) {
        console.error("Error al obtener el número de certificaciones:", error);
      }
    };
    if (companyId) fetchCount();
  }, [companyId]);

  const isLimitReached = fileCount >= MAX_FILES;

  const validateAndSetFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setCertificationError("Tipo de archivo no soportado. Usá PDF o imagen (JPG, PNG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setCertificationError("El archivo no puede superar los 10 MB.");
      return;
    }
    setCertificationError("");
    setCertificationFile(file);
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
    if (!certificationFile) {
      setCertificationError("Debes seleccionar un archivo.");
      return;
    }
    if (!certificationDescription.trim()) {
      setCertificationError("Debes proporcionar una descripción.");
      return;
    }
    setLoading(true);
    setCertificationError("");
    try {
      await axiosPostCertificationGallery(certificationDescription, companyId, [certificationFile]);
      displaySuccessMessage("Archivo cargado con éxito");
      setFileCount((prev) => prev + 1);
      setCertificationFile(null);
      setCertificationDescription("");
    } catch (error) {
      console.error("Error al cargar certificación:", error);
      setCertificationError("Error al cargar el archivo. Intentá nuevamente.");
      displayFailedMessage("Error al cargar el archivo");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCertificationFile(null);
    setCertificationDescription("");
    setCertificationError("");
  };

  const isPdf = certificationFile?.type === "application/pdf";
  const previewUrl = certificationFile ? URL.createObjectURL(certificationFile) : null;

  return (
    <div className="max-w-2xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Agregar Certificación / Homologación</h2>
        <p className="text-sm text-gray-500 mt-1">
          Subí tus certificados y homologaciones para que los clientes los puedan ver en tu perfil.
        </p>

        {/* Contador */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_FILES }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1.5 rounded-full transition-colors ${
                  i < fileCount ? "bg-[#191654]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {fileCount}/{MAX_FILES} archivos cargados
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
            Ya tienes {MAX_FILES} archivos cargados. Eliminá uno para poder agregar otro.
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
              ${certificationFile ? "border-emerald-300 bg-emerald-50" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />

            {certificationFile ? (
              <div className="flex flex-col items-center gap-2">
                {isPdf ? (
                  <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17h8v-1.5H8V17zm0-3h8v-1.5H8V14zm0-3h5v-1.5H8V11z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-gray-800">{certificationFile.name}</p>
                  <p className="text-xs text-gray-500">{(certificationFile.size / 1024).toFixed(1)} KB · Clic para cambiar</p>
                </div>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Archivo listo
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-[#191654]/10" : "bg-gray-100"}`}>
                  <svg className={`w-7 h-7 transition-colors ${isDragging ? "text-[#191654]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    {isDragging ? "Soltá el archivo aquí" : "Arrastrá o hacé clic para cargar"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG · Máximo 10 MB</p>
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
              value={certificationDescription}
              onChange={(e) => setCertificationDescription(e.target.value)}
              placeholder="Ej: ISO 9001:2015 — Gestión de Calidad"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#191654]/25 focus:border-[#191654] transition placeholder-gray-400"
              maxLength={120}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{certificationDescription.length}/120</p>
          </div>

          {/* Error */}
          {certificationError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {certificationError}
            </div>
          )}

          {/* Preview expandida */}
          {certificationFile && !isPdf && previewUrl && (
            <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full max-h-64 object-contain"
              />
              {certificationDescription && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700 font-medium">{certificationDescription}</p>
                </div>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            {certificationFile && (
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
              disabled={loading || !certificationFile}
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
                  Cargar archivo
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
