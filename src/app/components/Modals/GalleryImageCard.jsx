import React from "react";
import Image from "next/image";

function GalleryCard({ imageUrl, description, openModal }) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => openModal(imageUrl)}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={description || "Producto/Servicio"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400 text-sm">Sin imagen</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-gray-800 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ampliar
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
            Producto/Servicio
          </span>
        </div>
      </div>

      {/* Descripción */}
      <div className="px-4 py-3 flex flex-col gap-2">
        <p className="text-sm text-gray-700 font-medium line-clamp-2 leading-snug">
          {description || <span className="text-gray-400 italic">Sin descripción</span>}
        </p>
        <button className="self-start text-xs font-semibold text-[#191654] hover:underline flex items-center gap-1 mt-0.5">
          Ver imagen
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default GalleryCard;
