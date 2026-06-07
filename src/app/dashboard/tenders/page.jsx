'use client'
import Link from "next/link";
import { useGetTendersQuery } from "@/app/redux/services/tendersApi";
import CardUserTender from "@/app/components/CardUserTender";
import getLocalStorage from "@/app/Func/localStorage";
import PaginationComponent from "@/app/components/PaginationComponent";
import { useState } from "react";

function Licitaciones() {
  const userData = getLocalStorage();
  const { data: tenders, isLoading } = useGetTendersQuery();
  const [currentPage, setCurrentPage] = useState(1);

  const userTenders = !isLoading && tenders && Array.isArray(tenders) && userData?.company?.id
    ? tenders.filter((tender) => tender.company?.id === userData?.company?.id)
    : [];

  const itemsPerPage = 6;
  const totalPages = Math.ceil(userTenders.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const tendersUserToShow = userTenders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Estado de carga
  if (isLoading) {
    return (
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando licitaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Mis Licitaciones
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {userTenders.length === 0 
              ? "Aún no has creado licitaciones" 
              : `${userTenders.length} licitación${userTenders.length !== 1 ? 'es' : ''} en total`}
          </p>
        </div>
        <Link href="/dashboard/tenders/createTender">
          <button className="w-full sm:w-auto px-6 py-3 bg-[#191654] hover:bg-[#252075] active:bg-[#141240] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Licitación
          </button>
        </Link>
      </div>

      {/* Estado vacío */}
      {userTenders.length === 0 ? (
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-strokedark p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-meta-4 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tienes licitaciones
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comienza creando tu primera licitación para recibir propuestas de proveedores.
            </p>
            <Link href="/dashboard/tenders/createTender">
              <button className="px-6 py-3 bg-[#191654] hover:bg-[#252075] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                Crear Primera Licitación
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Grid de licitaciones */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {tendersUserToShow.map((tender) => (
              <CardUserTender key={tender.id} item={tender} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Licitaciones;
