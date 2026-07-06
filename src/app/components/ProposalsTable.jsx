"use client";
import { useState } from "react";
import { useUpdateProposalStatusMutation } from "../redux/services/ProposalApi";

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FEE_SCALE = [
  { max: 10000, fee: 2.5 },
  { max: 50000, fee: 2.25 },
  { max: 100000, fee: 2 },
  { max: 250000, fee: 1.75 },
  { max: 500000, fee: 1.5 },
  { max: 1000000, fee: 1 },
  { max: Infinity, fee: 0.5 },
];

const getPriceDiff = (referencePrice, quotedPrice) => {
  const ref = parseFloat(referencePrice);
  const quoted = parseFloat(quotedPrice);
  if (!ref || !quoted || isNaN(ref) || isNaN(quoted)) return null;
  const diff = quoted - ref;
  const pct = (diff / ref) * 100;
  return { diff, pct };
};

const ProposalDetailPanel = ({ proposal }) => {
  const quotes = proposal.servicePriceQuotes || [];
  const answers = proposal.customFieldAnswers || [];
  if (quotes.length === 0 && answers.length === 0) {
    return (
      <div className="px-6 py-3 text-sm text-gray-400 italic">
        Sin detalle de ítems cotizados.
      </div>
    );
  }
  const baseItems = quotes.filter((q) => !q.isExtra);
  const extraItems = quotes.filter((q) => q.isExtra);
  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-4">
      {quotes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Detalle de cotización
          </h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">Ítem</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">Tipo</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500 font-semibold">Ref. (USD)</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500 font-semibold">Cotizado (USD)</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500 font-semibold">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {baseItems.map((q, i) => {
                  const priceDiff = getPriceDiff(q.referencePrice, q.quotedPrice);
                  return (
                    <tr key={i}>
                      <td className="px-4 py-2 font-medium text-gray-800">{q.name}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">
                        {q.priceType === "per_day" ? "Por día" : "Fijo"}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-500">
                        {q.referencePrice != null ? fmt(q.referencePrice) : "—"}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-900">
                        {fmt(q.quotedPrice)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {priceDiff ? (
                          <span className={`text-xs font-semibold ${priceDiff.diff <= 0 ? "text-green-600" : "text-red-500"}`}>
                            {priceDiff.diff > 0 ? "+" : ""}{fmt(priceDiff.diff)} ({priceDiff.pct > 0 ? "+" : ""}{priceDiff.pct.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {extraItems.map((q, i) => (
                  <tr key={`extra-${i}`} className="bg-blue-50/50">
                    <td className="px-4 py-2 font-medium text-blue-800">
                      {q.name}
                      <span className="ml-1 text-xs text-blue-500">(extra)</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-400">Fijo</td>
                    <td className="px-4 py-2 text-right text-gray-400">—</td>
                    <td className="px-4 py-2 text-right font-semibold text-blue-700">
                      {fmt(q.quotedPrice)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-gray-300">—</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-200 bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                    Total propuesto
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-bold text-gray-900">
                    USD {fmt(proposal.totalAmount)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-1 text-right text-xs text-orange-600">
                    Energialy Fee ({proposal.serviceFee}%)
                  </td>
                  <td className="px-4 py-1 text-right text-xs text-orange-600">
                    − USD {fmt(proposal.serviceAmount)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-sm font-semibold text-green-700">
                    A recibir
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-bold text-green-700">
                    USD {fmt(proposal.receiverAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      {answers.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Información adicional
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {answers.map((a, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">{a.label}</p>
                <p className="text-sm font-medium text-gray-800">
                  {a.value === "true" ? "Sí" : a.value === "false" ? "No" : a.value || <span className="text-gray-400 italic">Sin respuesta</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProposalsTable = ({ proposals, tenderInfo, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [updateProposalStatus, { isLoading }] = useUpdateProposalStatusMutation();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [expandedId, setExpandedId] = useState(null);

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
                  <span className="flex items-center gap-1">
                    Energialy Fee
                    <span className="relative group">
                      <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="hidden group-hover:block absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 text-left normal-case font-normal">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Energialy Fee
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          Comisión que abonará el proveedor a Energialy si su propuesta es elegida. El porcentaje baja a medida que el monto de la propuesta es mayor:
                        </p>
                        <table className="w-full text-xs">
                          <tbody>
                            {FEE_SCALE.map((tier, idx) => {
                              const prevMax = idx === 0 ? 0 : FEE_SCALE[idx - 1].max;
                              return (
                                <tr key={idx} className="text-gray-500">
                                  <td className="py-0.5">
                                    {tier.max === Infinity
                                      ? `Más de USD ${prevMax.toLocaleString()}`
                                      : `Hasta USD ${tier.max.toLocaleString()}`}
                                  </td>
                                  <td className="py-0.5 text-right">{tier.fee}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </span>
                  </span>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedProposals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No hay propuestas para mostrar
                  </td>
                </tr>
              ) : null}
            </tbody>
            {sortedProposals.length > 0 && sortedProposals.map((proposal) => (
                  <tbody key={proposal.id}>
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
                        {/* Ver detalle */}
                        <button
                          onClick={() => setExpandedId(expandedId === proposal.id ? null : proposal.id)}
                          className="px-3 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
                        >
                          {expandedId === proposal.id ? (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                              Ocultar
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              Ver detalle
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === proposal.id && (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <ProposalDetailPanel proposal={proposal} />
                      </td>
                    </tr>
                  )}
                  </tbody>
                ))}
          </table>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto z-50 py-6">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 my-auto">
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
