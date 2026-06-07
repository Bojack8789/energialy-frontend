'use client'

import { ProposalModal } from "@/app/components/ProposalModal"
import { useGetTenderByIdQuery } from "@/app/redux/services/tendersApi"
import { useGetProposalsQuery } from "@/app/redux/services/ProposalApi"
import { useState, useEffect  } from "react"
import { useRouter} from "next/navigation"
import getLocalStorage from "@/app/Func/localStorage"
import axios from "axios"
import { displaySuccessMessage, displayFailedMessage } from "@/app/components/Toastify"
import TenderProjectDashboard from "@/app/components/TenderProjectDashboard"
import CompanyProfileModal from "@/app/components/CompanyProfileModal"

function TenderDetail({params}) {
  const tenderId = params.id
  const router = useRouter()
  const {data, isLoading, refetch} = useGetTenderByIdQuery(tenderId)
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [hasProposal, setHasProposal] = useState(false);
  const [receivedProposals, setReceivedProposals] = useState([]);
  const [acceptedProposalId, setAcceptedProposalId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [actionType, setActionType] = useState('');
  const [profileCompany, setProfileCompany] = useState(null);

  const companyId = user?.company?.id;
  const { data: proposals } = useGetProposalsQuery(companyId);

  // Verificar si la licitación es propia
  const isOwnTender = data?.company?.id === companyId;

  const handleOpen = () => setOpen(!open);

  useEffect(() => {
    const user = getLocalStorage();
    setUser(user)
  },[])

  useEffect(() => {
    if (proposals && tenderId && companyId) {
      const existingProposal = proposals.find(p => p.tender?.id === tenderId);
      setHasProposal(!!existingProposal);
    }
  }, [proposals, tenderId, companyId]);

  // Obtener propuestas recibidas si es la licitación propia
  useEffect(() => {
    if (isOwnTender && data?.proposals) {
      setReceivedProposals(data.proposals);

      // Verificar si ya hay una propuesta aceptada o seleccionada
      const accepted = data.proposals.find(p => p.status === 'accepted' || p.status === 'selected');
      if (accepted) {
        setAcceptedProposalId(accepted.id);
        setSelectedProposal(accepted);
      }
    }
  }, [isOwnTender, data]);

  const confirmAction = (proposal, action) => {
    setSelectedProposal(proposal);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!selectedProposal || !actionType) return;

    // Si ya hay una propuesta seleccionada y se intenta seleccionar otra
    if (actionType === 'selected' && acceptedProposalId) {
      displayFailedMessage('Ya has seleccionado una propuesta para esta licitación');
      setShowConfirmModal(false);
      return;
    }

    try {
      const accessToken = sessionStorage.getItem('accessToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/proposals/${selectedProposal.id}`,
        { status: actionType },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const statusMessages = {
        preselected: 'Propuesta preseleccionada exitosamente',
        selected: 'Propuesta seleccionada exitosamente. Todas las demás han sido rechazadas.',
        rejected: 'Propuesta rechazada'
      };

      displaySuccessMessage(statusMessages[actionType] || 'Propuesta actualizada');

      if (actionType === 'selected') {
        setAcceptedProposalId(selectedProposal.id);
      }

      // Pequeño delay para asegurar que el backend haya procesado todo
      await new Promise(resolve => setTimeout(resolve, 300));

      // Refrescar datos de la licitación (incluye propuestas actualizadas)
      await refetch();

      setShowConfirmModal(false);
      setSelectedProposal(null);
      setActionType('');
    } catch (error) {
      console.error('Error updating proposal:', error);
      displayFailedMessage('Error al actualizar la propuesta');
      setShowConfirmModal(false);
    }
  };

  console.log(user);
  const renderDescription = () => {
    // Check if data.description is not empty
    return data?.description ? (
      <div
        dangerouslySetInnerHTML={{
          __html: data?.description,
        }}
      />
    ) : null;
  };

  return (
    <div>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <div className="m-3">
          {/* Si hay una propuesta seleccionada y es la licitación propia, mostrar el dashboard */}
          {isOwnTender && acceptedProposalId && selectedProposal ? (
            <div>
              {/* Header con botón volver */}
              <div className="mb-6 flex justify-between items-center">
                <button
                  type="button"
                  className="inline-block rounded bg-gray-500 px-6 py-3 text-sm font-medium uppercase leading-normal text-white hover:bg-gray-600 transition duration-150 ease-in-out"
                  onClick={() => router.back()}
                >
                  ← Volver
                </button>
              </div>

              {/* Dashboard del proyecto */}
              <TenderProjectDashboard
                tender={data}
                selectedProposal={selectedProposal}
              />
            </div>
          ) : (
            <>
              {/* Vista normal de la licitación */}
              <div className="block rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
                <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-neutral-600 dark:text-neutral-50">
                  {data?.company?.name}
                </div>
                <div className="p-6">
                  <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
                    {data?.title}
                  </h5>
                  <div className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
                    {renderDescription()}
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    {!isOwnTender && (
                      hasProposal ? (
                        <div className="inline-block rounded bg-green-100 border border-green-400 text-green-700 px-6 pb-2 pt-2.5 text-xs font-medium uppercase">
                          ✓ Propuesta enviada - Ver en &quot;Mis Propuestas&quot;
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="inline-block rounded bg-primary-500 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                          onClick={handleOpen}
                        >
                          Presentar Propuesta
                        </button>
                      )
                    )}
                    {isOwnTender && (
                      <button
                        type="button"
                        className="inline-block rounded bg-yellow-500 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-yellow-600 focus:outline-none"
                        onClick={() => router.push(`/dashboard/tenders/edit/${tenderId}`)}
                      >
                        Editar Licitación
                      </button>
                    )}
                    <button
                      type="button"
                      className="inline-block rounded bg-secondary-500 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-secondary-800 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                      onClick={() => router.back()}
                    >
                      Volver
                    </button>
                  </div>
                </div>

                <ProposalModal open={open} handleOpen={handleOpen} data={data} />
              </div>

              {/* Mostrar propuestas recibidas solo si es la licitación propia */}
              {isOwnTender && receivedProposals.length > 0 && (
            <div className="mt-6 block rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
              <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-neutral-600 dark:text-neutral-50">
                <h3 className="text-lg font-semibold">Propuestas Recibidas ({receivedProposals.length})</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(() => {
                    console.log('🔍 DEBUG - Received Proposals:', receivedProposals.map(p => ({
                      name: p.Company?.name,
                      status: p.status,
                      statusType: typeof p.status,
                      statusLength: p.status?.length,
                      statusCharCodes: p.status ? [...p.status].map(c => c.charCodeAt(0)) : null
                    })));

                    const sorted = [...receivedProposals].sort((a, b) => {
                      // Ordenar: seleccionada primero, luego preseleccionadas, luego enviadas, luego rechazadas
                      const statusOrder = { 'selected': 0, 'accepted': 0, 'preselected': 1, 'sent': 2, 'rejected': 3 };

                      // Trim the status to remove any whitespace
                      const statusA = (a.status || '').trim();
                      const statusB = (b.status || '').trim();

                      const orderA = statusOrder[statusA] !== undefined ? statusOrder[statusA] : 99;
                      const orderB = statusOrder[statusB] !== undefined ? statusOrder[statusB] : 99;

                      console.log(`Comparing ${a.Company?.name}(${statusA}="${orderA}") vs ${b.Company?.name}(${statusB}="${orderB}") = ${orderA - orderB}`);
                      return orderA - orderB;
                    });

                    console.log('✅ AFTER SORT:', sorted.map(p => ({ name: p.Company?.name, status: p.status })));
                    return sorted;
                  })()
                    .map((proposal) => {
                      const isSelected = proposal.status === 'selected' || proposal.status === 'accepted';
                      return (
                    <div
                      key={proposal.id}
                      className={`border rounded-lg p-4 transition-shadow ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-lg'
                          : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-semibold text-lg text-gray-800">
                              {proposal.company?.name || proposal.Company?.name || 'Empresa no especificada'}
                            </h4>
                            {(proposal.company?.id || proposal.Company?.id) && (
                              <button
                                onClick={() => setProfileCompany({ id: proposal.company?.id || proposal.Company?.id, name: proposal.company?.name || proposal.Company?.name })}
                                className="inline-block rounded bg-gray-100 border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                Ver Perfil
                              </button>
                            )}
                          </div>
                          <p className="text-gray-600 mt-2">{proposal.description}</p>
                          <div className="mt-3 flex gap-4 text-sm">
                            <span className="text-gray-700">
                              <strong>Monto:</strong> ${proposal.totalAmount?.toLocaleString()}
                            </span>
                            <span className="text-gray-700">
                              <strong>Duración:</strong> {proposal.projectDuration} días
                            </span>
                          </div>
                          {/* Badge de estado */}
                          <div className="mt-2">
                            {proposal.status === 'sent' && (
                              <span className="inline-block rounded bg-blue-100 border border-blue-400 text-blue-700 px-3 py-1 text-xs font-medium uppercase">
                                Enviada
                              </span>
                            )}
                            {proposal.status === 'preselected' && (
                              <span className="inline-block rounded bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-1 text-xs font-medium uppercase">
                                ⭐ Preseleccionada
                              </span>
                            )}
                            {(proposal.status === 'selected' || proposal.status === 'accepted') && (
                              <span className="inline-block rounded bg-green-100 border border-green-400 text-green-700 px-3 py-1 text-xs font-medium uppercase">
                                ✓ Seleccionada
                              </span>
                            )}
                            {proposal.status === 'rejected' && (
                              <span className="inline-block rounded bg-red-100 border border-red-400 text-red-700 px-3 py-1 text-xs font-medium uppercase">
                                ✗ Rechazada
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          {/* Botones de acción */}
                          {proposal.status === 'sent' && !acceptedProposalId && (
                            <>
                              <button
                                onClick={() => confirmAction(proposal, 'preselected')}
                                className="inline-block rounded bg-yellow-500 px-4 py-2 text-xs font-medium uppercase leading-normal text-white hover:bg-yellow-600 transition duration-150 ease-in-out focus:outline-none"
                              >
                                Preseleccionar
                              </button>
                              <button
                                onClick={() => confirmAction(proposal, 'selected')}
                                className="inline-block rounded bg-green-500 px-4 py-2 text-xs font-medium uppercase leading-normal text-white hover:bg-green-600 transition duration-150 ease-in-out focus:outline-none"
                              >
                                Seleccionar
                              </button>
                              <button
                                onClick={() => confirmAction(proposal, 'rejected')}
                                className="inline-block rounded bg-red-500 px-4 py-2 text-xs font-medium uppercase leading-normal text-white hover:bg-red-600 transition duration-150 ease-in-out focus:outline-none"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {proposal.status === 'preselected' && !acceptedProposalId && (
                            <>
                              <button
                                onClick={() => confirmAction(proposal, 'selected')}
                                className="inline-block rounded bg-green-500 px-4 py-2 text-xs font-medium uppercase leading-normal text-white hover:bg-green-600 transition duration-150 ease-in-out focus:outline-none"
                              >
                                Seleccionar
                              </button>
                              <button
                                onClick={() => confirmAction(proposal, 'rejected')}
                                className="inline-block rounded bg-red-500 px-4 py-2 text-xs font-medium uppercase leading-normal text-white hover:bg-red-600 transition duration-150 ease-in-out focus:outline-none"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {(proposal.status === 'selected' || proposal.status === 'accepted') && (
                            <span className="text-green-600 font-semibold text-sm text-center">✓ Propuesta Seleccionada</span>
                          )}
                          {proposal.status === 'rejected' && (
                            <span className="text-red-600 font-semibold text-sm text-center">Rechazada</span>
                          )}
                          {acceptedProposalId && proposal.status === 'sent' && (
                            <span className="text-gray-400 text-xs text-center">No disponible<br/>(Ya hay una seleccionada)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          )}

          {isOwnTender && receivedProposals.length === 0 && (
            <div className="mt-6 block rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 p-6">
              <p className="text-gray-600 text-center">No has recibido propuestas para esta licitación aún.</p>
            </div>
          )}

          {/* Modal de Confirmación */}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {actionType === 'selected' && '¿Seleccionar esta propuesta?'}
                    {actionType === 'preselected' && '¿Preseleccionar esta propuesta?'}
                    {actionType === 'rejected' && '¿Rechazar esta propuesta?'}
                  </h3>

                  {/* Información de la propuesta */}
                  {selectedProposal && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                      <p className="font-semibold text-gray-900">{selectedProposal.company?.name}</p>
                      <p className="text-sm text-gray-600 mt-1">Monto: ${selectedProposal.totalAmount?.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Duración: {selectedProposal.projectDuration}</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 mb-6 text-left">
                    {actionType === 'selected' && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="font-semibold text-yellow-800 mb-2">⚠️ Atención:</p>
                        <p className="text-yellow-700">
                          Al seleccionar esta propuesta, <strong>todas las demás propuestas se marcarán automáticamente como rechazadas</strong> y no podrás cambiar tu decisión.
                        </p>
                        <p className="text-yellow-700 mt-2">
                          Esta acción cerrará la licitación.
                        </p>
                      </div>
                    )}
                    {actionType === 'preselected' && (
                      <p>Esta propuesta quedará marcada como candidata. Podrás preseleccionar otras propuestas antes de tomar la decisión final.</p>
                    )}
                    {actionType === 'rejected' && (
                      <p>Esta propuesta quedará marcada como rechazada y no será considerada.</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowConfirmModal(false);
                        setSelectedProposal(null);
                        setActionType('');
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={executeAction}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors text-white ${
                        actionType === 'selected'
                          ? 'bg-green-600 hover:bg-green-700'
                          : actionType === 'preselected'
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    )}
      {profileCompany && (
        <CompanyProfileModal
          companyId={profileCompany.id}
          companyName={profileCompany.name}
          onClose={() => setProfileCompany(null)}
        />
      )}
    </div>
  );
}

export default TenderDetail