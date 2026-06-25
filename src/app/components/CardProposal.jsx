"use client";
import { useEffect, useState } from "react";
import "tw-elements/css/tw-elements.min.css";
import { useRouter } from "next/navigation";
import CompanyProfileModal from "@/app/components/CompanyProfileModal";

const CardProposal = ({ item }) => {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await import("tw-elements");
      } catch (error) {
        console.log('tw-elements initialization skipped');
      }
    };
    init();
  }, []);

  return (
    <div className="rounded-lg bg-white p-4 md:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 mb-4 w-full">
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-primary-100 p-3 text-center align-baseline text-base font-bold leading-none text-primary-700 mb-3">
                {item.tender?.Company?.name}
              </span>
            </div>
            <h5 className="mb-2 text-xl font-semibold leading-tight text-neutral-800 dark:text-neutral-50">
              {item.tender.title}
            </h5>
            <p className="mb-4 text-base font-medium text-neutral-600">
              {item.tender.description ? item.tender.description : "Sin descripción"}
            </p>
            <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-orange-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-orange-800">
              {item.tender.majorSector}
            </span>
          </div>

          {showDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h6 className="text-md font-semibold mb-3 text-neutral-800">Detalles de tu Propuesta</h6>
              <div className="mb-3">
                <p className="text-xs font-medium text-neutral-600 mb-1">Duración del Proyecto</p>
                <p className="text-sm text-neutral-800">{item.projectDuration || 'No especificado'}</p>
              </div>
              {item.description && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-neutral-600 mb-1">Descripción del Trabajo</p>
                  <p className="text-sm text-neutral-700 bg-white p-3 rounded border">{item.description}</p>
                </div>
              )}
              {item.serviceFee && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-neutral-600 mb-1">Fee Energialy</p>
                  <p className="text-sm text-neutral-800">{item.serviceFee}% (USD {item.serviceAmount?.toLocaleString()})</p>
                </div>
              )}
              {item.receiverAmount && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-neutral-600 mb-1">Monto a Recibir</p>
                  <p className="text-sm text-green-700 font-bold">USD {item.receiverAmount?.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="inline-block rounded bg-secondary-600 px-4 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-secondary-700"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
            </button>
            <button
              type="button"
              className="inline-block rounded bg-gray-700 px-4 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.3)] transition duration-150 ease-in-out hover:bg-gray-800"
              onClick={() => setShowProfile(true)}
            >
              Ver Perfil
            </button>
            <button
              type="button"
              className="inline-block rounded bg-primary-800 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600"
              onClick={() => item.tender?.id && router.push(`/tenders/${item.tender.id}`)}
            >
              Ver Licitación
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-0 lg:w-auto">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-neutral-600">Presupuesto Licitación</p>
            <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-info-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-info-800">
              USD: {item.tender.budget}
            </span>
            <p className="text-xs font-medium text-neutral-600">Estado Licitación</p>
            {item.tender.status === "published" ? (
              <span className="inline-block whitespace-nowrap rounded-lg bg-green-400 p-2 text-center align-baseline text-[0.80em] font-bold leading-none text-neutral-200">
                En evaluación de Propuestas
              </span>
            ) : (
              <span className="inline-block whitespace-nowrap rounded-lg bg-red-400 p-2 text-center align-baseline text-[0.80em] font-bold leading-none text-neutral-300">
                Cerrada
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-neutral-600">Presupuesto Propuesta</p>
            <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-info-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-info-800">
              USD: {item.totalAmount}
            </span>
            <p className="text-xs font-medium text-neutral-600">Estado Propuesta</p>
            {item.status === "sent" ? (
              <span className="inline-block whitespace-nowrap rounded-lg bg-green-400 p-2 text-center align-baseline text-[0.80em] font-bold leading-none text-neutral-200">
                Enviada
              </span>
            ) : item.status === "accepted" ? (
              <span className="inline-block whitespace-nowrap rounded-lg bg-green-400 p-2 text-center align-baseline text-[0.80em] font-bold leading-none text-white">
                Adjudicada
              </span>
            ) : (
              <span className="inline-block whitespace-nowrap rounded-lg bg-red-400 p-2 text-center align-baseline text-[0.80em] font-bold leading-none text-neutral-300">
                Cerrada
              </span>
            )}
          </div>
        </div>
      </div>

      {showProfile && item.tender?.Company?.id && (
        <CompanyProfileModal
          companyId={item.tender.Company.id}
          companyName={item.tender.Company.name}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default CardProposal;
