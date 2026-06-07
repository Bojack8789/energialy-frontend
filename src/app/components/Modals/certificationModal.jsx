import React from "react";

const ModalFile = ({ filesUrl, onClose }) => {
  const isPDF = filesUrl?.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPDF ? "bg-red-100" : "bg-blue-100"}`}>
              {isPDF ? (
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {isPDF ? "Documento PDF" : "Certificado / Homologación"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50">
          {isPDF ? (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-red-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17h8v-1.5H8V17zm0-3h8v-1.5H8V14zm0-3h5v-1.5H8V11z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Documento PDF</p>
                <p className="text-sm text-gray-500 mt-1">Abrí el PDF en una nueva pestaña para verlo completo.</p>
              </div>
              <a
                href={filesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#191654] text-white text-sm font-semibold rounded-xl hover:bg-[#191654]/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir PDF
              </a>
            </div>
          ) : (
            <img
              src={filesUrl}
              alt="Certificación"
              className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalFile;
