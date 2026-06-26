"use client";
import React, { useState } from "react";
import { useUpdateProposalStatusMutation } from "../redux/services/ProposalApi";

const ProposalsTable = ({ proposals, tenderInfo, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [updateProposalStatus, { isLoading }] = useUpdateProposalStatusMutation();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [expandedProposal, setExpandedProposal] = useState(null);

  // Filtrar propuestas por estado
  const filteredProposals = proposals?.filter((proposal) => {
    if (filterStatus === "all") return true;
    return proposal.status === filterStatus;
  });

  // Obtener badge de estado
  const getStatusBadge = (status, isActive) => {
    if (!isActive) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-400 text-white">
          Desactivada
        </span>
      );
    }

    const statusConfig = {
      sent: { bg: "bg-blue-100", text: "text-blue-800", label: "Enviada" },
      preselected: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Preseleccionada" },
      selected: { bg: "bg-green-100", text: "text-green-800", label: "Seleccionada" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rechazada" },
      accepted: { bg: "bg-green-100", text: "text-green-800", label: "Aceptada" },
      declined: { bg: "bg-red-100", text: "text-red-800", label: "Declinada" },
    };

    const config = statusConfig[status] || statusConfig.sent;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Manejar actualización de estado
  const handleStatusUpdate = async (proposalId, newStatus, currentIsActive) => {
    try {
      await updateProposalStatus({
        id: proposalId,
        status: newStatus,
        isActive: currentIsActive,
      }).unwrap();

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Error al actualizar el estado de la propuesta");
    }
  };

  // Manejar toggle de isActive
  const handleToggleActive = async (proposalId, currentStatus, currentIsActive) => {
    try {
      await updateProposalStatus({
        id: proposalId,
        status: currentStatus,
        isActive: !currentIsActive,
      }).unwrap();

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Error al actualizar el estado de la propuesta");
    }
  };

  // Confirmar selección de propuesta
  const confirmAction = (proposal, action) => {
    setSelectedProposal(proposal);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!selectedProposal) return;

    await handleStatusUpdate(
      selectedProposal.id,
      actionType,
      selectedProposal.isActive
    );
    setShowConfirmModal(false);
    setSelectedProposal(null);
    setActionType("");
  };

  // Ordenar propuestas: seleccionada primero, luego por monto
  const sortedProposals = [...(filteredProposals || [])].sort((a, b) => {
    if (a.status === "selected") return -1;
    if (b.status === "selected") return 1;
    return a.totalAmount - b.totalAmount;
  });

  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtrar por Estado</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todas ({proposals?.length || 0})
          </button>
          <button
            onClick={() => setFilterStatus("sent")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "sent"
                ? "bg-blue-500 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Enviadas ({proposals?.filter((p) => p.status === "sent").length || 0})
          </button>
          <button
            onClick={() => setFilterStatus("preselected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "preselected"
                ? "bg-yellow-500 text-white"
                : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            }`}
          >
            Preseleccionadas ({proposals?.filter((p) => p.status === "preselected").length || 0})
          </button>
          <button
            onClick={() => setFilterStatus("selected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "selected"
                ? "bg-green-500 text-white"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            Seleccionada ({proposals?.filter((p) => p.status === "selected").length || 0})
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "rejected"
                ? "bg-red-500 text-white"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            Rechazadas ({proposals?.filter((p) => p.status === "rejected").length || 0})
          </button>
        </div>
      </div>

      {/* Tabla de Propuestas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Monto (USD)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fee Energialy
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  A Recibir
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedProposals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No hay propuestas para mostrar
                  </td>
                </tr>
              ) : (
                sortedProposals.map((proposal, index) => (
                  <React.Fragment key={proposal.id}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors ${
                      proposal.status === "selected" ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {proposal.Company?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {proposal.status === "selected" && (
                              <span className="text-green-600 font-semibold">⭐ Propuesta Principal</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        ${proposal.totalAmount?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        vs Presupuesto: ${tenderInfo?.budget?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {proposal.projectDuration}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{proposal.serviceFee}%</div>
                      <div className="text-xs text-gray-500">
                        ${proposal.serviceAmount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-green-600">
                        ${proposal.receiverAmount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(proposal.status, proposal.isActive)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedProposal(expandedProposal === proposal.id ? null : proposal.id)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md transition-colors"
                      >
                        {expandedProposal === proposal.id ? "▲ Ocultar" : "▼ Ver más"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {/* Botones de estado */}
                        {proposal.status === "sent" && proposal.isActive && (
                          <>
                            <button
                              onClick={() => confirmAction(proposal, "preselected")}
                              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-md transition-colors"
                              disabled={isLoading}
                            >
                              Preseleccionar
                            </button>
                            <button
                              onClick={() => confirmAction(proposal, "selected")}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors"
                              disabled={isLoading}
                            >
                              Seleccionar
                            </button>
                            <button
                              onClick={() => confirmAction(proposal, "rejected")}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors"
                              disabled={isLoading}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {proposal.status === "preselected" && proposal.isActive && (
                          <>
                            <button
                              onClick={() => confirmAction(proposal, "selected")}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors"
                              disabled={isLoading}
                            >
                              Seleccionar
                            </button>
                            <button
                              onClick={() => confirmAction(proposal, "rejected")}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors"
                              disabled={isLoading}
                            >
                              Rechazar
                            </button>
                          </>
                        )}

                        {/* Toggle Activo/Inactivo */}
                        <button
                          onClick={() => handleToggleActive(proposal.id, proposal.status, proposal.isActive)}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            proposal.isActive
                              ? "bg-gray-500 hover:bg-gray-600 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                          disabled={isLoading}
                        >
                          {proposal.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Panel expandible con descripción, campos personalizados y servicios */}
                  {expandedProposal === proposal.id && (
                    <tr className="bg-blue-50">
                      <td colSpan="8" className="px-6 py-4">
                        <div className="space-y-4">
                          {/* Descripción */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Descripción del trabajo</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{proposal.description || "Sin descripción"}</p>
                          </div>

                          {/* Cotización de servicios */}
                          {proposal.servicePriceQuotes?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Cotización de servicios</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {proposal.servicePriceQuotes.map((sq, i) => (
                                  <div key={i} className="bg-white border border-gray-200 rounded-md p-3">
                                    <p className="text-sm font-medium text-gray-800">{sq.name}</p>
                                    <p className="text-xs text-gray-500">Referencia: U$D {sq.referencePrice} {sq.priceType === 'per_day' ? '/ día' : '(fijo)'}</p>
                                    <p className="text-sm font-bold text-blue-700 mt-1">
                                      Cotizado: U$D {sq.quotedPrice} {sq.priceType === 'per_day' ? '/ día' : '(fijo)'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Respuestas a campos personalizados */}
                          {proposal.customFieldAnswers?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Información adicional</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {proposal.customFieldAnswers.map((ans, i) => (
                                  <div key={i} className="bg-white border border-gray-200 rounded-md p-3">
                                    <p className="text-xs font-medium text-gray-500">{ans.label}</p>
                                    <p className="text-sm text-gray-800 mt-1">{ans.value?.toString() || "Sin respuesta"}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Si no hay campos extra */}
                          {!proposal.servicePriceQuotes?.length && !proposal.customFieldAnswers?.length && (
                            <p className="text-sm text-gray-500 italic">No hay información adicional en esta propuesta.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionType === "selected" && "¿Seleccionar esta propuesta?"}
                {actionType === "preselected" && "¿Preseleccionar esta propuesta?"}
                {actionType === "rejected" && "¿Rechazar esta propuesta?"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {actionType === "selected" && (
                  <>
                    <strong>Atención:</strong> Al seleccionar esta propuesta, todas las demás propuestas
                    se marcarán automáticamente como rechazadas.
                  </>
                )}
                {actionType === "preselected" && "Esta propuesta quedará marcada como preseleccionada."}
                {actionType === "rejected" && "Esta propuesta quedará marcada como rechazada."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedProposal(null);
                    setActionType("");
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeAction}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsTable;
