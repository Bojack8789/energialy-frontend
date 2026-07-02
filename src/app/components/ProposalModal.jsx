'use client'
import Select from "react-select";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import getLocalStorage from "../Func/localStorage";
import { urlProduction } from "../data/dataGeneric";
import { getAccessToken, getUserId } from "../Func/sessionStorage";
import LimitExceededModal from "./LimitExceededModal";

const displaySuccessMessage = (msg) =>
  toast.success(msg, { position: "top-right", autoClose: 2000, theme: "light" });

const displayFailedMessage = (msg) =>
  toast.error(msg, { position: "top-right", autoClose: 3000, theme: "light" });

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const calculateServiceFeePercentage = (amount) => {
  if (amount <= 10000) return 2.5;
  if (amount <= 50000) return 2.25;
  if (amount <= 100000) return 2;
  if (amount <= 250000) return 1.75;
  if (amount <= 500000) return 1.5;
  if (amount <= 1000000) return 1;
  return 0.5;
};

const FEE_SCALE = [
  { max: 10000, fee: 2.5 },
  { max: 50000, fee: 2.25 },
  { max: 100000, fee: 2 },
  { max: 250000, fee: 1.75 },
  { max: 500000, fee: 1.5 },
  { max: 1000000, fee: 1 },
  { max: Infinity, fee: 0.5 },
];

export function ProposalModal({ open, handleOpen, data }) {
  const userData = getLocalStorage();

  const [hasPermission, setHasPermission] = useState(true);
  const [projectDuration, setProjectDuration] = useState("");
  const [description, setDescription] = useState("");
  const [servicePriceQuotes, setServicePriceQuotes] = useState([]);
  const [extraItems, setExtraItems] = useState([]);
  const [customFieldAnswers, setCustomFieldAnswers] = useState([]);
  const [limitExceededModal, setLimitExceededModal] = useState({ isOpen: false, limitInfo: null });
  const [showFeeInfo, setShowFeeInfo] = useState(false);

  // Verificar permiso de colaborador
  useEffect(() => {
    if (!userData || userData.role !== "company_collaborator") return;
    const checkPerm = async () => {
      try {
        const token = getAccessToken();
        const userId = getUserId();
        if (!token || !userId) { setHasPermission(false); return; }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/permissions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const d = await res.json();
          setHasPermission(Array.isArray(d.permissions) && d.permissions.includes("PROPUESTAS"));
        } else {
          setHasPermission(false);
        }
      } catch {
        setHasPermission(false);
      }
    };
    checkPerm();
  }, []);

  // Inicializar cuando llega data
  useEffect(() => {
    if (!data?.id) return;
    if (data.servicePrices?.length > 0) {
      setServicePriceQuotes(
        data.servicePrices.map((s) => ({
          name: s.name,
          description: s.description || "",
          referencePrice: s.price,
          priceType: s.priceType,
          quotedPrice: "",
        }))
      );
    }
    if (data.customFields?.length > 0) {
      setCustomFieldAnswers(
        data.customFields.map((f) => ({
          label: f.label,
          type: f.type,
          options: f.options || [],
          value: "",
        }))
      );
    }
    setExtraItems([]);
    setProjectDuration("");
    setDescription("");
  }, [data?.id]);

  // Cálculos derivados
  const serviceSubtotal = servicePriceQuotes.reduce(
    (sum, s) => sum + (parseFloat(s.quotedPrice) || 0), 0
  );
  const extraSubtotal = extraItems.reduce(
    (sum, e) => sum + (parseFloat(e.price) || 0), 0
  );
  const totalAmount = serviceSubtotal + extraSubtotal;
  const feePercent = calculateServiceFeePercentage(totalAmount);
  const feeAmount = (totalAmount * feePercent) / 100;
  const receiverAmount = totalAmount - feeAmount;

  const getPriceDiff = (referencePrice, quotedPrice) => {
    const ref = parseFloat(referencePrice);
    const quoted = parseFloat(quotedPrice);
    if (!ref || !quoted || isNaN(ref) || isNaN(quoted)) return null;
    const diff = quoted - ref;
    const pct = (diff / ref) * 100;
    return { diff, pct };
  };

  const addExtraItem = () =>
    setExtraItems([...extraItems, { name: "", price: "" }]);

  const removeExtraItem = (i) =>
    setExtraItems(extraItems.filter((_, idx) => idx !== i));

  const updateExtraItem = (i, field, value) => {
    const updated = [...extraItems];
    updated[i] = { ...updated[i], [field]: value };
    setExtraItems(updated);
  };

  const getValidToken = async () => {
    let token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
    if (!token) {
      try {
        const r = await axios.get(`${urlProduction}/refresh`, { withCredentials: true });
        token = r.data.accessToken;
        if (token) sessionStorage.setItem("accessToken", token);
      } catch {
        return null;
      }
    }
    return token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalAmount <= 0) {
      displayFailedMessage("El total de la propuesta debe ser mayor a cero");
      return;
    }
    if (!projectDuration) {
      displayFailedMessage("Por favor seleccioná la duración del proyecto");
      return;
    }
    if (!description.trim()) {
      displayFailedMessage("Por favor ingresá una descripción del trabajo");
      return;
    }
    if (!data?.id) {
      displayFailedMessage("Error: ID de licitación no disponible");
      return;
    }
    if (!userData?.company?.id) {
      displayFailedMessage("Error: ID de empresa no disponible. Recargá la página.");
      return;
    }

    const allQuotes = [
      ...servicePriceQuotes.map((s) => ({
        name: s.name,
        description: s.description,
        referencePrice: s.referencePrice,
        priceType: s.priceType,
        quotedPrice: parseFloat(s.quotedPrice) || 0,
        isExtra: false,
      })),
      ...extraItems.map((e) => ({
        name: e.name,
        description: "",
        referencePrice: null,
        priceType: "fixed",
        quotedPrice: parseFloat(e.price) || 0,
        isExtra: true,
      })),
    ];

    const payload = {
      totalAmount,
      projectDuration,
      description,
      tenderId: data.id,
      companyId: userData.company.id,
      servicePriceQuotes: allQuotes,
      customFieldAnswers,
    };

    try {
      const token = await getValidToken();
      if (!token) {
        displayFailedMessage("Tu sesión expiró. Por favor iniciá sesión nuevamente.");
        setTimeout(() => { window.location.href = "/"; }, 2000);
        return;
      }
      const response = await axios.post(`${urlProduction}/proposals`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        displaySuccessMessage("¡Propuesta enviada exitosamente!");
        setTimeout(() => {
          handleOpen();
          window.location.reload();
        }, 2500);
      } else {
        displayFailedMessage("Algo salió mal, por favor intentá nuevamente.");
      }
    } catch (error) {
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        error.response?.data?.error === "Invalid or expired token"
      ) {
        sessionStorage.removeItem("accessToken");
        displayFailedMessage("Tu sesión expiró. Por favor iniciá sesión nuevamente.");
        setTimeout(() => { sessionStorage.removeItem("user"); window.location.href = "/"; }, 2000);
      } else if (error.response?.status === 403) {
        const d = error.response.data;
        if (d.limitExceeded || d.upgradeRequired) {
          setLimitExceededModal({ isOpen: true, limitInfo: d });
        }
      } else if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || "";
        if (msg.includes("subscription") || msg.includes("límite") || msg.includes("plan")) {
          const pd = error.response?.data?.data;
          setLimitExceededModal({
            isOpen: true,
            limitInfo: {
              message: msg,
              detail: pd ? `Tenés ${pd.activeCount} propuestas activas.` : "Actualizá tu plan.",
              currentCount: pd?.activeCount,
              limit: pd?.limit,
              planName: pd?.planName,
              limitExceeded: true,
              upgradeRequired: true,
            },
          });
        } else if (msg.includes("own tender")) {
          displayFailedMessage("No podés enviar propuestas a tus propias licitaciones.");
        } else if (msg.includes("Ya enviaste")) {
          displayFailedMessage("Ya enviaste una propuesta para esta licitación.");
          setTimeout(handleOpen, 2500);
        } else {
          displayFailedMessage("Error al enviar la propuesta. Completá todos los campos.");
        }
      } else {
        displayFailedMessage("Error al enviar la propuesta. Intentá nuevamente.");
      }
    }
  };

  const optionDuration = [
    "Menos de una semana",
    "Menos de un mes",
    "De 1 a 3 meses",
    "De 3 a 6 meses",
    "Más de 6 meses",
  ];

  if (!data) return null;

  return (
    <>
      <div
        className={
          !open
            ? "hidden"
            : "fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-75 flex items-start justify-center py-6"
        }
      >
        <div className="mx-auto w-full max-w-3xl bg-white rounded-lg shadow-xl my-auto">

          {/* Acceso restringido */}
          {!hasPermission ? (
            <div className="flex flex-col items-center justify-center py-10 text-center p-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h3>
              <p className="text-gray-600 mb-1">No tenés permiso para enviar propuestas.</p>
              <p className="text-gray-500 text-sm mb-6">Contactá a tu empleador para solicitar el permiso de <strong>Propuestas</strong>.</p>
              <button className="bg-gray-600 px-4 py-2 rounded-md text-white font-bold" onClick={handleOpen}>Cerrar</button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{data.company?.name}</p>
                  <h2 className="text-lg font-bold text-gray-900">{data.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.budget && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                        Presupuesto: USD {Number(data.budget).toLocaleString()}
                      </span>
                    )}
                    {data.location && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {data.location.name}
                      </span>
                    )}
                    {data.majorSector && (
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full font-medium">
                        {data.majorSector}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={handleOpen} className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">

                {/* ── TABLA DE PRESUPUESTO ── */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Detalle de la Propuesta
                  </h3>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Encabezado tabla */}
                    <div className="grid grid-cols-12 gap-2 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                      <span className="col-span-4">Servicio / Ítem</span>
                      <span className="col-span-2">Descripción</span>
                      <span className="col-span-2 text-right">Ref. (USD)</span>
                      <span className="col-span-2 text-right">Tu precio (USD)</span>
                      <span className="col-span-2 text-right">Diferencia</span>
                    </div>

                    {/* Servicios de la licitación */}
                    {servicePriceQuotes.length > 0 && (
                      <div className="divide-y divide-gray-100">
                        {servicePriceQuotes.map((s, i) => {
                          const priceDiff = getPriceDiff(s.referencePrice, s.quotedPrice);
                          return (
                            <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
                              <div className="col-span-4">
                                <span className="text-sm font-medium text-gray-800">{s.name}</span>
                                <span className="ml-2 text-xs text-gray-400">
                                  ({s.priceType === "per_day" ? "por día" : "fijo"})
                                </span>
                              </div>
                              <div className="col-span-2 text-xs text-gray-500">{s.description}</div>
                              <div className="col-span-2 text-right text-sm text-gray-500">
                                {s.referencePrice ? fmt(s.referencePrice) : "—"}
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0.00"
                                  value={s.quotedPrice}
                                  onChange={(e) => {
                                    const updated = [...servicePriceQuotes];
                                    updated[i] = { ...updated[i], quotedPrice: e.target.value };
                                    setServicePriceQuotes(updated);
                                  }}
                                  className="w-full text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="col-span-2 text-right">
                                {priceDiff ? (
                                  <span className={`text-xs font-semibold ${priceDiff.diff <= 0 ? "text-green-600" : "text-red-500"}`}>
                                    {priceDiff.diff > 0 ? "+" : ""}{fmt(priceDiff.diff)} ({priceDiff.pct > 0 ? "+" : ""}{priceDiff.pct.toFixed(1)}%)
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-300">—</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Ítems extra del proveedor */}
                    <div className="border-t border-dashed border-gray-300 bg-blue-50/30 px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                          Ítems adicionales que vos agregás
                        </span>
                      </div>

                      {extraItems.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {extraItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
                              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <input
                                type="text"
                                placeholder="Nombre del ítem (ej: Viáticos, Materiales extra...)"
                                value={item.name}
                                onChange={(e) => updateExtraItem(i, "name", e.target.value)}
                                className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-400">USD</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="0.00"
                                value={item.price}
                                onChange={(e) => updateExtraItem(i, "price", e.target.value)}
                                className="w-28 text-right border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => removeExtraItem(i)}
                                className="text-red-400 hover:text-red-600 flex-shrink-0"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={addExtraItem}
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors border border-dashed border-blue-300 hover:border-blue-500 rounded-lg px-3 py-1.5 w-full justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar ítem propio a la propuesta
                      </button>
                    </div>

                    {/* Totales */}
                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-1">
                      {extraItems.length > 0 && (
                        <>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Subtotal servicios</span>
                            <span>USD {fmt(serviceSubtotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Subtotal ítems propios</span>
                            <span>USD {fmt(extraSubtotal)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm font-semibold text-gray-800 pt-1 border-t border-gray-200">
                        <span>Total propuesta</span>
                        <span>USD {fmt(totalAmount)}</span>
                      </div>
                      <div className="relative flex justify-between items-center text-xs text-orange-600">
                        <span className="flex items-center gap-1">
                          Fee Energialy ({feePercent}%)
                          <button
                            type="button"
                            onMouseEnter={() => setShowFeeInfo(true)}
                            onMouseLeave={() => setShowFeeInfo(false)}
                            onClick={() => setShowFeeInfo((v) => !v)}
                            className="text-orange-400 hover:text-orange-600"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          {showFeeInfo && (
                            <div className="absolute left-0 bottom-full mb-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 text-left normal-case">
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                ¿Por qué se aplica esta comisión?
                              </p>
                              <p className="text-xs text-gray-500 mb-2">
                                Energialy cobra una comisión por intermediar el pago de forma segura entre las empresas. El porcentaje baja a medida que el monto de la propuesta es mayor:
                              </p>
                              <table className="w-full text-xs">
                                <tbody>
                                  {FEE_SCALE.map((tier, idx) => {
                                    const prevMax = idx === 0 ? 0 : FEE_SCALE[idx - 1].max;
                                    const isCurrent = tier.fee === feePercent;
                                    return (
                                      <tr key={idx} className={isCurrent ? "bg-orange-50 font-semibold text-orange-700" : "text-gray-500"}>
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
                          )}
                        </span>
                        <span>− USD {fmt(feeAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-green-700 pt-1 border-t border-gray-200">
                        <span>Ingresos que recibís</span>
                        <span>USD {fmt(receiverAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── DURACIÓN Y DESCRIPCIÓN ── */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración del trabajo</label>
                    <Select
                      placeholder="Seleccioná la duración..."
                      options={optionDuration.map((d) => ({ value: d, label: d }))}
                      onChange={(e) => setProjectDuration(e.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del trabajo</label>
                    <textarea
                      rows={4}
                      placeholder="Describí de forma detallada el trabajo que realizarás en esta licitación..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* ── CAMPOS PERSONALIZADOS ── */}
                {customFieldAnswers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Información Adicional Requerida
                    </h3>
                    <div className="space-y-3">
                      {customFieldAnswers.map((f, i) => (
                        <div key={i}>
                          <label className="block text-sm text-gray-700 font-medium mb-1">{f.label}</label>
                          {f.type === "boolean" ? (
                            <select
                              className="border border-gray-300 rounded-md p-2 text-sm w-full"
                              value={f.value}
                              onChange={(e) => {
                                const u = [...customFieldAnswers];
                                u[i] = { ...u[i], value: e.target.value };
                                setCustomFieldAnswers(u);
                              }}
                            >
                              <option value="">Seleccionar...</option>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </select>
                          ) : f.type === "select" ? (
                            <select
                              className="border border-gray-300 rounded-md p-2 text-sm w-full"
                              value={f.value}
                              onChange={(e) => {
                                const u = [...customFieldAnswers];
                                u[i] = { ...u[i], value: e.target.value };
                                setCustomFieldAnswers(u);
                              }}
                            >
                              <option value="">Seleccionar...</option>
                              {(f.options || []).map((opt, oi) => (
                                <option key={oi} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : f.type === "radio" ? (
                            <div className="flex flex-col gap-1">
                              {(f.options || []).map((opt, oi) => (
                                <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`radio_${i}`}
                                    value={opt}
                                    checked={f.value === opt}
                                    onChange={() => {
                                      const u = [...customFieldAnswers];
                                      u[i] = { ...u[i], value: opt };
                                      setCustomFieldAnswers(u);
                                    }}
                                    className="accent-blue-600"
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          ) : f.type === "textarea" ? (
                            <textarea
                              rows={3}
                              className="border border-gray-300 rounded-md p-2 text-sm w-full"
                              value={f.value}
                              onChange={(e) => {
                                const u = [...customFieldAnswers];
                                u[i] = { ...u[i], value: e.target.value };
                                setCustomFieldAnswers(u);
                              }}
                            />
                          ) : (
                            <input
                              type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                              className="border border-gray-300 rounded-md p-2 text-sm w-full"
                              value={f.value}
                              onChange={(e) => {
                                const u = [...customFieldAnswers];
                                u[i] = { ...u[i], value: e.target.value };
                                setCustomFieldAnswers(u);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── AVISO + BOTONES ── */}
                <p className="text-xs text-red-500 font-medium">
                  Una vez enviada, la propuesta no puede modificarse.
                </p>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSubmit}
                    disabled={totalAmount <= 0}
                    className="flex-1 bg-[#191654] hover:bg-[#252075] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Enviar Propuesta
                  </button>
                  <button
                    onClick={handleOpen}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <ToastContainer style={{ marginTop: "100px" }} />
      </div>

      <LimitExceededModal
        isOpen={limitExceededModal.isOpen}
        onClose={() => setLimitExceededModal({ isOpen: false, limitInfo: null })}
        limitInfo={limitExceededModal.limitInfo}
      />
    </>
  );
}
