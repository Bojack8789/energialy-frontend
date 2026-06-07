import React, { useState } from "react";
import Image from "next/image";

function FilesCard({ imageUrl, description, openModal, onSaveDescription, onDelete, id, canEdit = true }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);

  const isPdf = (url) => url?.toLowerCase().endsWith(".pdf");
  const isImage = (url) => /\.(jpeg|jpg|gif|png|webp)$/i.test(url);

  const handleView = () => {
    if (isPdf(imageUrl)) {
      window.open(imageUrl, "_blank");
    } else {
      openModal(imageUrl);
    }
  };

  const handleSaveClick = () => {
    onSaveDescription(id, newDescription);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewDescription(description);
  };

  return (
    <>
      <div className="group relative flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Thumbnail */}
        <div
          className="relative w-full h-44 bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer overflow-hidden"
          onClick={handleView}
        >
          {isImage(imageUrl) ? (
            <Image
              src={imageUrl}
              alt={description || "Certificación"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : isPdf(imageUrl) ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17h8v-1.5H8V17zm0-3h8v-1.5H8V14zm0-3h5v-1.5H8V11z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-red-500 tracking-wide uppercase">PDF</span>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400 text-sm">Archivo no soportado</span>
            </div>
          )}

          {/* Overlay hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-800 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver
              </div>
            </div>
          </div>

          {/* Badge tipo */}
          <div className="absolute top-2 left-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPdf(imageUrl) ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
              {isPdf(imageUrl) ? "PDF" : "Imagen"}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          <div className="flex-1 min-h-[2rem]">
            <p className="text-sm text-gray-700 font-medium line-clamp-2 leading-snug">
              {description || <span className="text-gray-400 italic">Sin descripción</span>}
            </p>
          </div>

          {canEdit && (
            <div className="flex gap-2 pt-1 border-t border-gray-50">
              <button
                onClick={handleView}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-[#191654]/5 hover:bg-[#191654]/10 text-[#191654] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Confirmar eliminación */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Eliminar archivo</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                onClick={() => { onDelete(id); setShowConfirm(false); }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar descripción */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Editar descripción</h2>
            </div>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#191654]/30 focus:border-[#191654] mb-5 transition"
              placeholder="Descripción del archivo..."
              autoFocus
            />
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                onClick={handleSaveClick}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FilesCard;
