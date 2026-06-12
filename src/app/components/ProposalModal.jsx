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
    const [serviceFeePercentage, setServiceFeePercentage] = useState(1);
    const [serviceAmount, setServiceAmount] = useState(0);
    const [receiverAmount, setReceiverAmount] = useState(0);
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
        calculateFee(numericValue, serviceFeePercentage);
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

        console.log('Sending proposal:', proposal);
        createProposal(proposal);
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
                <div className="text-xs">
                  <span className="font-bold">(USD) {serviceAmount}</span>{" "}
                  {"  "}
                  <span className="font-bold text-secondary-600">
                    &quot;Energialy&quot;
                  </span>
                  ServiceFee ( Fee: entre 2,5% y 0.5%)
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
              {/* <UploadthingButton/> */}
            </div>
          </div>
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