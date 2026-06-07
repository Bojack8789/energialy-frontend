import React, { useState } from 'react';
import { useGetTenderInvitationsQuery } from '@/app/redux/services/tendersApi';
import TenderInvitationsModal from './TenderInvitationsModal';

const TenderInvitationsPanel = ({ tenderId, tenderTitle }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { data: invitations, isLoading, refetch } = useGetTenderInvitationsQuery(tenderId);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'invited': { label: 'Invitado', class: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' },
      'proposal_sent': { label: 'Envió Propuesta', class: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' },
      'viewed': { label: 'Visto', class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
      'declined': { label: 'Rechazó', class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' }
    };

    const config = statusConfig[status] || statusConfig['invited'];
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="border-t border-gray-200 dark:border-strokedark bg-white dark:bg-boxdark">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Invitaciones
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {invitations?.length || 0} {invitations?.length === 1 ? 'invitación enviada' : 'invitaciones enviadas'}
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#191654] text-white text-sm font-medium rounded-lg hover:bg-[#252075] active:bg-[#141240] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#191654] focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invitar Usuarios
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-transparent mb-2"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando invitaciones...</p>
            </div>
          </div>
        ) : (
          <>
            {invitations && invitations.length > 0 ? (
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-gray-50 dark:bg-meta-4 rounded-lg border border-gray-200 dark:border-strokedark hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {invitation.userEmail}
                        </p>
                      </div>

                      {invitation.isRegistered && invitation.user && (
                        <div className="flex items-center gap-2 ml-6 mb-1">
                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {invitation.user.firstName} {invitation.user.lastName}
                            {invitation.user.company && <span className="text-gray-500 dark:text-gray-500"> • {invitation.user.company.name}</span>}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-6">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Invitado el {new Date(invitation.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {getStatusBadge(invitation.status)}
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                        invitation.isRegistered
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                          : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                        {invitation.isRegistered ? '✓ Registrado' : 'Por email'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-meta-4 rounded-lg border border-gray-200 dark:border-strokedark">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-boxdark rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  No hay invitaciones enviadas
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Haz clic en &quot;Invitar Usuarios&quot; para comenzar
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <TenderInvitationsModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          refetch();
        }}
        tenderId={tenderId}
        tenderTitle={tenderTitle}
      />
    </div>
  );
};

export default TenderInvitationsPanel;
