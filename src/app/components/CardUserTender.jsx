'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import TenderInvitationsPanel from "./TenderInvitationsPanel";
import { useState } from "react";

function CardUserTender({item}) {
  const totalProposal = item.proposals?.length || 0;
  const id = item.id;
  const router = useRouter();
  const [showInvitations, setShowInvitations] = useState(false);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-strokedark overflow-hidden hover:shadow-md transition-shadow duration-200 w-full mb-6">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-strokedark bg-gray-50 dark:bg-meta-4">
        <h3 className="mb-3 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {item.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {item.subcategories?.map((sub, index) => (
            <span
              key={index}
              className="inline-block whitespace-nowrap rounded-full bg-white dark:bg-boxdark border border-gray-200 dark:border-strokedark px-3 py-1 text-xs font-medium text-gray-700 dark:text-white"
            >
              {sub.name}
            </span>
          ))}
        </div>
      </div>

      {/* Table-style content */}
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200 dark:divide-strokedark">
              {/* Presupuesto */}
              <tr className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                <td className="py-3 sm:py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-boxdark-2 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Presupuesto</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">U$S {item.budget}</p>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Ubicación */}
              <tr className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                <td className="py-3 sm:py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-boxdark-2 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Ubicación</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{item.location?.name || 'No especificado'}</p>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Vencimiento */}
              <tr className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                <td className="py-3 sm:py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-boxdark-2 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Fecha de Vencimiento</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{formatDate(item.validityDate)}</p>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Propuestas */}
              <tr className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                <td className="py-3 sm:py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-boxdark-2 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Propuestas Recibidas</p>
                      <Link href={`tenders/tenderProposals/${id}`}>
                        <p className="text-base sm:text-lg font-semibold text-[#191654] dark:text-primary hover:underline cursor-pointer">
                          {totalProposal > 0 ? totalProposal : "0"}
                        </p>
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-strokedark bg-gray-50 dark:bg-meta-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="flex-1 rounded-lg bg-[#191654] px-6 py-3 text-sm font-medium leading-normal text-white shadow-sm hover:bg-[#252075] active:bg-[#141240] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#191654] focus:ring-offset-2"
            onClick={() => router.push(`/tenders/${item.id}`)}
          >
            Ver Licitación
          </button>

          <button
            type="button"
            className="flex-1 rounded-lg bg-gray-600 px-6 py-3 text-sm font-medium leading-normal text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
            onClick={() => setShowInvitations(!showInvitations)}
          >
            {showInvitations ? 'Ocultar Invitaciones' : 'Gestionar Invitaciones'}
          </button>
        </div>
      </div>

      {/* Panel de invitaciones */}
      {showInvitations && (
        <TenderInvitationsPanel
          tenderId={item.id}
          tenderTitle={item.title}
        />
      )}
    </div>
  );
}

export default CardUserTender;
