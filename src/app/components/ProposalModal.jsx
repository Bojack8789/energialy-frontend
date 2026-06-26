'use client'
// import {
//   Button,
//   Dialog,
//   Card,
//   CardHeader,
//   CardBody,
//   CardFooter,
//   Typography,
//   Input,
//   Checkbox,
// } from "@material-tailwind/react";
import Select from "react-select";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import getLocalStorage from "../Func/localStorage";
//import UploadthingButton from "./UploadthingButton";
import { urlProduction } from "../data/dataGeneric";
import { getAccessToken, getUserId } from "../Func/sessionStorage";
import LimitExceededModal from "./LimitExceededModal";





//Toastify module for success message
const displaySuccessMessage = (mensaje) => {
  toast.success(mensaje, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
};

// Toastify module for error messages
const displayFailedMessage = (mensaje) => {
  toast.error(mensaje, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
};



export function ProposalModal({open, handleOpen, data}) {

    const [proposal, setProposal] = useState({
      totalAmount: 0,
      projectDuration: "",
      description: "",
      tenderId: "",
      companyId: "",
      // attachments: [],
    });

    
    const userData = getLocalStorage();
    const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;

    // Control de acceso: colaboradores necesitan permiso LICITACIONES para enviar propuestas
    const [hasPermission, setHasPermission] = useState(true);

    useEffect(() => {
      const checkLicitacionesPermission = async () => {
        if (!userData) return;
        if (userData.role !== "company_collaborator") return;
        try {
          const token = getAccessToken();
          const userId = getUserId();
          if (!token || !userId) { setHasPermission(false); return; }
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/permissions`,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
          );
          if (response.ok) {
            const data = await response.json();
            setHasPermission(Array.isArray(data.permissions) && data.permissions.includes("PROPUESTAS"));
          } else {
            setHasPermission(false);
          }
        } catch (error) {
          console.error("Error verificando permisos de propuestas:", error);
          setHasPermission(false);
        }
      };
      checkLicitacionesPermission();
    }, []);

    const [serviceFeePercentage, setServiceFeePercentage] = useState(2);
    const [serviceAmount, setServiceAmount] = useState(0);
    const [receiverAmount, setReceiverAmount] = useState(0);
    const [showFeeTooltip, setShowFeeTooltip] = useState(false);

    // Respuestas a campos personalizados y servicios de la licitación
    const [customFieldAnswers, setCustomFieldAnswers] = useState({});
    const [servicePriceQuotes, setServicePriceQuotes] = useState({});

    const getCommissionRate = (amount) => {
      if (amount <= 50000) return 2;
      if (amount <= 200000) return 1.75;
      if (amount <= 500000) return 1.5;
      if (amount <= 1000000) return 1.25;
      return 1;
    };
    const [limitExceededModal, setLimitExceededModal] = useState({
      isOpen: false,
      limitInfo: null,
    });


    // const createProposal = async (proposal) => {
    //   try {
    //     const response = await axios.post(
    //       `${urlProduction}/proposals`,
    //       proposal
    //     );
    //     displaySuccessMessage("Propuesta enviada");
    //     setProposal({
    //       totalAmount: 0,
    //       projectDuration: "",
    //       description: "",
    //       tenderId: "",
    //       companyId: "",
    //     });
    //     setTimeout(() => {
    //       handleOpen()
    //     }, 2000);
    //   } catch (error) {
    //     displayFailedMessage(
    //       "Error al enviar la propuesta, Por favor complete todos los campos"
    //     );
    //   }
    //   console.log(error);
    // };
    const getValidToken = async () => {
      let token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      if (!token) {
        try {
          const refreshRes = await axios.get(`${urlProduction}/refresh`, { withCredentials: true });
          token = refreshRes.data.accessToken;
          if (token) sessionStorage.setItem('accessToken', token);
        } catch {
          return null;
        }
      }
      return token;
    };

    const createProposal = async (proposal) => {
      try {
        const token = await getValidToken();
        if (!token) {
          displayFailedMessage("Tu sesión expiró. Por favor iniciá sesión nuevamente.");
          setTimeout(() => { window.location.href = '/'; }, 2000);
          return;
        }
        const response = await axios.post(
          `${urlProduction}/proposals`,
          proposal,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Verificar el estado de la respuesta
        if (response.status === 201) {
          displaySuccessMessage("¡Propuesta enviada exitosamente! Podés verla en 'Mis Propuestas'");
          console.log('Propuesta creada con ID:', response.data.id);

          // Restablecer el formulario
          setProposal({
            totalAmount: 0,
            projectDuration: "",
            description: "",
            tenderId: "",
            companyId: "",
          });
          setCustomFieldAnswers({});
          setServicePriceQuotes({});

          setTimeout(() => {
            handleOpen();
            // Refrescar la página para mostrar la nueva propuesta
            window.location.reload();
          }, 2500);
        } else {
          displayFailedMessage("Algo salió mal, por favor inténtelo de nuevo.");
        }
      } catch (error) {
        console.log(error.response);

        // Token inválido o expirado — limpiar y redirigir al login
        if ((error.response?.status === 401 || error.response?.status === 403) &&
            error.response?.data?.error === 'Invalid or expired token') {
          sessionStorage.removeItem('accessToken');
          displayFailedMessage("Tu sesión ha expirado. Por favor iniciá sesión nuevamente.");
          setTimeout(() => { sessionStorage.removeItem('user'); window.location.href = '/'; }, 2000);
        }
        // Check for subscription limit errors (403 from middleware)
        else if (error.response?.status === 403) {
          const errorData = error.response.data;
          if (errorData.limitExceeded || errorData.upgradeRequired) {
            // Show LimitExceededModal
            setLimitExceededModal({
              isOpen: true,
              limitInfo: errorData,
            });
            return;
          }
        }
        // Check for subscription limit errors (old 400 format - kept for backwards compatibility)
        else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.error || error.response?.data?.message;
          if (errorMessage && (errorMessage.includes("subscription") || errorMessage.includes("límite") || errorMessage.includes("plan"))) {
            // Show upgrade modal with old format
            const planData = error.response?.data?.data;
            const limitInfo = {
              message: errorMessage,
              detail: planData
                ? `Actualmente tenés ${planData.activeCount} propuestas activas.`
                : "Para enviar más propuestas, actualiza tu plan.",
              currentCount: planData?.activeCount,
              limit: planData?.limit,
              planName: planData?.planName,
              limitExceeded: true,
              upgradeRequired: true,
            };
            setLimitExceededModal({
              isOpen: true,
              limitInfo,
            });
            return;
          } else if (errorMessage && errorMessage.includes("own tender")) {
            displayFailedMessage(
              "No puedes enviar propuestas a tus propias licitaciones."
            );
          } else if (errorMessage && errorMessage.includes("Ya enviaste una propuesta")) {
            displayFailedMessage(
              "Ya enviaste una propuesta para esta licitación. Podés verla en 'Mis Propuestas'."
            );
            setTimeout(() => {
              handleOpen();
            }, 2500);
          } else {
            displayFailedMessage(
              "Error al enviar la propuesta. Por favor complete todos los campos correctamente."
            );
          }
        }
        else {
          displayFailedMessage(
            "Error al enviar la propuesta. Por favor intente nuevamente."
          );
        }
      }
    };
    const calculateFee = (totalAmount, serviceFeePercentage) => {
      if (
        typeof serviceFeePercentage !== "number" ||
        serviceFeePercentage < 0 ||
        serviceFeePercentage > 100
      ) {
        throw new Error(
          "Service fee percentage must be a number between 0 and 100."
        );
      }
      const serviceAmount = (totalAmount * serviceFeePercentage) / 100;
      const receiverAmount = totalAmount - serviceAmount;
      
      setServiceAmount(serviceAmount);
      setReceiverAmount(receiverAmount);
      return { serviceAmount, receiverAmount };
    
    };
    // const validations = (proposalCompanyId, tenderCompanyId) => {
    //   if(proposalCompanyId === tenderCompanyId) {
    //     displayFailedMessage(
    //       "No puede presentar propuestas a su propia Empresa"
    //     );
    //   }else{
    //     return 
    //   }

    // }

    // const handleSave = async (e) => {
    //   console.log(e)
    //   setProposal(...proposal, { proposalState: "save" });
    //   console.log(proposal);
    // }

    const handleInput = (e) => {
      const { name, value } = e.target;
      if (name === "totalAmount") {
        const numericValue = parseFloat(value) || 0;
        const rate = getCommissionRate(numericValue);
        setServiceFeePercentage(rate);
        calculateFee(numericValue, rate);
        setProposal({ ...proposal, [name]: numericValue });
        return;
      }
      setProposal({ ...proposal, [name]: value });
    }

    const handleSubmit = async (e) => {

        e.preventDefault();

        // Validar que todos los campos requeridos estén presentes
        if (!proposal.totalAmount || proposal.totalAmount <= 0) {
          displayFailedMessage("Por favor ingresa un monto válido para la propuesta");
          return;
        }
        if (!proposal.projectDuration) {
          displayFailedMessage("Por favor selecciona la duración del proyecto");
          return;
        }
        if (!proposal.description || proposal.description.trim() === "") {
          displayFailedMessage("Por favor ingresa una descripción del trabajo");
          return;
        }
        if (!proposal.tenderId) {
          displayFailedMessage("Error: ID de licitación no disponible");
          return;
        }
        if (!proposal.companyId) {
          displayFailedMessage("Error: ID de empresa no disponible. Por favor recarga la página.");
          return;
        }

        // Validar campos personalizados requeridos
        const tenderCustomFields = data?.customFields || [];
        for (const field of tenderCustomFields) {
          if (field.required && !customFieldAnswers[field.label]?.toString().trim()) {
            displayFailedMessage(`El campo "${field.label}" es requerido`);
            return;
          }
        }

        // Construir payload con campos adicionales
        const customFieldAnswersArray = tenderCustomFields.map(field => ({
          label: field.label,
          type: field.type,
          value: customFieldAnswers[field.label] ?? "",
        }));

        const tenderServicePrices = data?.servicePrices || [];
        const servicePriceQuotesArray = tenderServicePrices.map(service => ({
          name: service.name,
          priceType: service.priceType,
          referencePrice: service.price,
          quotedPrice: parseFloat(servicePriceQuotes[service.name]) || 0,
        }));

        const fullProposal = {
          ...proposal,
          customFieldAnswers: customFieldAnswersArray,
          servicePriceQuotes: servicePriceQuotesArray,
        };

        console.log('Sending proposal:', fullProposal);
        createProposal(fullProposal);
    }
  
    const optionDuration = [
        "Menos de una semana",
        "Menos de un mes",
        "De 1 a 3 meses",
        "De 3 a 6 meses",
        "Más de 6 meses",
      ];
      
      useEffect(() => {
        if (data?.id && userData?.company?.id) {
          setProposal((prev) => ({
            ...prev,
            tenderId: data.id,
            companyId: userData.company.id,
          }));
          console.log('ProposalModal - Setting IDs:', {
            tenderId: data.id,
            companyId: userData.company.id
          });
        }
      }, [data?.id, userData?.company?.id])

  if (!data || !data.company) return null;

  return (
    <>
      <div
        open={open}
        handler={handleOpen}
        className={`${
          !open
            ? "hidden"
            : "fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center"
        }`}
      >
        <div className="mx-auto w-full max-w-[75%]  p-4 bg-slate-50 rounded-md">
          {/* Acceso restringido para colaboradores sin permiso LICITACIONES */}
          {!hasPermission && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h3>
              <p className="text-gray-600 mb-1">No tienes permiso para enviar propuestas.</p>
              <p className="text-gray-500 text-sm mb-6">Contacta a tu empleador para solicitar el permiso de <strong>Licitaciones</strong>.</p>
              <button
                className="bg-secondary-500 px-4 py-2 rounded-md text-white font-bold"
                onClick={handleOpen}
              >
                Cerrar
              </button>
            </div>
          )}
          {hasPermission && (
          <>
          <div className="flex flex-col gap-2 md:flex-row ">
            <div className="md:min-w-[75%]">
              <h4 className="mb-4 text-xl">{data.company?.name}</h4>
              <h5 className="mb-4 text-lg">{data.title}</h5>
              <p className="mb-4 text-base">
                Duración del proyecto: {data.projectDuration}
              </p>
              <p className="mb-1 text-sm">
                Completa todos los campos para presentar tu propuesta. <br />
                <span className="text-red-500 text-xs font-bold">
                  Una vez enviada, no podrá ser modificada
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <span class="inline-block whitespace-nowrap rounded-[0.27rem] bg-slate-300 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-info-800">
                USD: {data.budget}
              </span>
              {data.location && (
                <span
                  class={`${
                    data.location.id === "e8bbe98e-a725-44bb-b7d8-990013794f5c"
                      ? "bg-secondary-200 text-secondary-800"
                      : data.location.id ===
                        "9a83f3bb-0472-4e7e-bb67-9c8bdf996cd3"
                      ? "bg-danger-500 text-danger-700"
                      : "bg-info-800 text-info-700"
                  } inline-block whitespace-nowrap rounded-[0.27rem]  px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none `}
                >
                  {data.location?.name}
                </span>
              )}
              {!data.location && data.address && (
                <span class="inline-block whitespace-nowrap rounded-[0.27rem] bg-info-800 text-info-700 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none">
                  {data.address}
                </span>
              )}
              <span class="inline-block whitespace-nowrap rounded-[0.27rem] bg-teal-200 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-teal-800">
                {data.majorSector}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="">Ingrese el monto de su propuesta:</label>
              <input
                type="number"
                placeholder="USD"
                name="totalAmount"
                value={proposal.totalAmount || ""}
                className="border-1 mt-1 w-full p-2 rounded-md"
                onChange={handleInput}
              />
              <div className="mt-2 flex justify-start gap-5 ml-2">
                <div className="text-xs relative">
                  <span className="font-bold">(USD) {serviceAmount}</span>{" "}
                  {"  "}
                  <span className="font-bold text-secondary-600">
                    &quot;Energialy&quot;
                  </span>
                  {" "}ServiceFee{" "}
                  <span
                    className="cursor-pointer text-secondary-600 underline"
                    onMouseEnter={() => setShowFeeTooltip(true)}
                    onMouseLeave={() => setShowFeeTooltip(false)}
                  >
                    (+ info &gt;)
                  </span>
                  {showFeeTooltip && (
                    <div className="absolute left-0 top-5 z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3 w-64">
                      <p className="text-center font-bold text-secondary-600 mb-2 text-xs uppercase tracking-wide">
                        Tabla de Comisiones
                      </p>
                      <table className="w-full text-xs">
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 pr-2">U$D 0 a U$D 50,000</td>
                            <td className="py-1 font-bold text-right">2%</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 pr-2">U$D 50,001 a U$D 200,000</td>
                            <td className="py-1 font-bold text-right">1,75%</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 pr-2">U$D 200,001 a U$D 500,000</td>
                            <td className="py-1 font-bold text-right">1,5%</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 pr-2">U$D 500,001 a U$D 1,000,000</td>
                            <td className="py-1 font-bold text-right">1,25%</td>
                          </tr>
                          <tr>
                            <td className="py-1 pr-2">U$D 1,000,001 o mayor</td>
                            <td className="py-1 font-bold text-right">1%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-bold">(USD) {receiverAmount}</span>{" "}
                  Ingresos que recibirás si tu Propuesta es elegida{" "}
                </div>
              </div>
            </div>
            <label htmlFor="">Duración:</label>
            <Select
              placeholder="TIEMPO DE EJECUCIÓN DE LA LICITACION"
              options={optionDuration?.map((duration) => ({
                value: duration,
                label: duration,
              }))}
              onChange={(e) =>
                setProposal({ ...proposal, projectDuration: e.value })
              }
            />
            <div className="flex flex-col gap-3">
              <label htmlFor="">Descripción del Trabajo</label>
              <textarea
                name="description"
                placeholder="Mensaje a la empresa que contratará tus servicios. Indicá de forma detallada el trabajo que realizarás en esta licitación"
                id="description"
                rows={10}
                cols={70}
                className="border-2 border-gray-300 rounded-md p-2"
                onChange={handleInput}
              ></textarea>
            </div>
          </div>

          {/* Servicios a cotizar */}
          {data?.servicePrices?.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Cotización de Servicios</h4>
              <p className="text-xs text-gray-500 mb-3">El creador definió los siguientes servicios. Indicá tu precio para cada uno.</p>
              <div className="flex flex-col gap-3">
                {data.servicePrices.map((service, i) => (
                  <div key={i} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{service.name}</p>
                        {service.description && <p className="text-xs text-gray-500">{service.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          Precio de referencia: U$D {service.price} {service.priceType === 'per_day' ? '/ día' : '(fijo)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">U$D</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={`Tu precio ${service.priceType === 'per_day' ? 'por día' : 'fijo'}`}
                        value={servicePriceQuotes[service.name] ?? ""}
                        onChange={(e) => setServicePriceQuotes(prev => ({ ...prev, [service.name]: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      {service.priceType === 'per_day' && <span className="text-xs text-gray-500">/ día</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campos personalizados de la licitación */}
          {data?.customFields?.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Información Adicional Requerida</h4>
              <div className="flex flex-col gap-4">
                {data.customFields.map((field, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.placeholder && <p className="text-xs text-gray-400">{field.placeholder}</p>}

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={customFieldAnswers[field.label] ?? ""}
                        onChange={(e) => setCustomFieldAnswers(prev => ({ ...prev, [field.label]: e.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        rows={3}
                        value={customFieldAnswers[field.label] ?? ""}
                        onChange={(e) => setCustomFieldAnswers(prev => ({ ...prev, [field.label]: e.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={customFieldAnswers[field.label] ?? ""}
                        onChange={(e) => setCustomFieldAnswers(prev => ({ ...prev, [field.label]: e.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={customFieldAnswers[field.label] ?? ""}
                        onChange={(e) => setCustomFieldAnswers(prev => ({ ...prev, [field.label]: e.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={customFieldAnswers[field.label] ?? ""}
                        onChange={(e) => setCustomFieldAnswers(prev => ({ ...prev, [field.label]: e.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      >
                        <option value="">Seleccionar...</option>
                        {field.options?.map((opt, oi) => <option key={oi} value={opt}>{opt}</option>)}
                      </select>
                    )}
                    {field.type === 'radio' && (
                      <div className="flex flex-col gap-2">
                        {field.options?.map((opt, oi) => (
                          <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={`field_${i}`}
                              value={opt}
                              checked={customFieldAnswers[field.label] === opt}
                              onChange={() => setCustomFieldAnswers(prev => ({ ...prev, [field.label]: opt }))}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3">
            <div className="flex justify-around">
              <button
                className="bg-primary-600 px-4 py-2 rounded-md text-white font-bold"
                onClick={handleSubmit}
              >
                Enviar
              </button>
              {/* <button className="bg-green-600" onClick={handleSave}>
                Guardar
              </button> */}
              <button
                className="bg-secondary-500 px-4 py-2 rounded-md text-white font-bold"
                onClick={handleOpen}
              >
                Cancelar
              </button>
            </div>
          </div>
          </>
          )} {/* fin bloque hasPermission */}
        </div>
        <ToastContainer style={{ marginTop: "100px" }} />
      </div>

      {/* Limit Exceeded Modal */}
      <LimitExceededModal
        isOpen={limitExceededModal.isOpen}
        onClose={() =>
          setLimitExceededModal({ isOpen: false, limitInfo: null })
        }
        limitInfo={limitExceededModal.limitInfo}
      />
    </>
  );
}