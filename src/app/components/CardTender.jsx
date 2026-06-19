"use client";
import { useEffect, useState } from "react";
import PaginationComp from "./Pagination";
import { useRouter } from "next/navigation";
import CompanyProfileModal from "@/app/components/CompanyProfileModal";

function FormattedString({ content }) {
  return <div dangerouslySetInnerHTML={{__html: content}}></div>;
}

const CardTender = ({item, isOwn}) => {
  const router = useRouter();
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

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <>
    <div className={`rounded-lg bg-white p-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 w-full mb-4 flex flex-col gap-3 ${isOwn ? 'border-2 border-primary-300' : ''}`}>

      {/* Nombre empresa + fecha en la misma fila */}
      <div className="flex items-start justify-between gap-2">
        <span className={`rounded-[0.27rem] px-3 py-1.5 text-sm font-bold leading-none ${isOwn ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'}`}>
          {item.company?.name}
          {isOwn && <span className="ml-1.5 text-xs font-normal opacity-90">(Mi empresa)</span>}
        </span>
        {formattedDate && (
          <span className="shrink-0 text-xs text-gray-400 whitespace-nowrap pt-1">
            📅 {formattedDate}
          </span>
        )}
      </div>

      {/* Ubicación + presupuesto en fila */}
      <div className="flex flex-wrap items-center gap-2">
        {item.location && (
          <span className={`rounded-[0.27rem] px-3 py-1.5 text-xs font-bold leading-none ${
            item.location.id === "e8bbe98e-a725-44bb-b7d8-990013794f5c"
              ? "bg-success-100 text-success-700"
              : item.location.id === "9a83f3bb-0472-4e7e-bb67-9c8bdf996cd3"
              ? "bg-danger-100 text-danger-700"
              : "bg-neutral-200 text-neutral-700"
          }`}>
            {item.location.name}
          </span>
        )}
        <span className="rounded-[0.27rem] bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold leading-none text-blue-700">
          {item.showBudget ? `USD ${Number(item.budget).toLocaleString('es-AR')}` : 'Presupuesto no disponible'}
        </span>
        {item.company?.id && !isOwn && (
          <button
            type="button"
            className="rounded bg-gray-100 border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={() => setShowProfile(true)}
          >
            Ver Perfil
          </button>
        )}
      </div>

      {/* Título */}
      <h5 className="text-lg font-semibold leading-snug text-neutral-800 dark:text-neutral-50">
        {item.title}
      </h5>

      {/* Descripción */}
      <div className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">
        <FormattedString content={item.description} />
      </div>

      {/* Subcategorías */}
      {item.subcategories?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.subcategories.map((sub, index) => (
            <span key={index} className="rounded-full bg-neutral-200 px-2.5 py-1 text-[0.70em] font-bold leading-none text-neutral-600">
              {sub.name}
            </span>
          ))}
        </div>
      )}

      {/* Botones en fila */}
      <div className="flex flex-row gap-2 pt-1">
        <button
          type="button"
          className="rounded bg-primary-800 px-5 py-2 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out hover:bg-primary-600 focus:outline-none active:bg-primary-700"
          onClick={() => router.push(`/tenders/${item.id}`)}
        >
          Ver Licitación
        </button>
        {isOwn && (
          <button
            type="button"
            className="rounded bg-green-600 px-5 py-2 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out hover:bg-green-700 focus:outline-none"
            onClick={() => router.push(`/tenders/${item.id}`)}
          >
            Promocionar
          </button>
        )}
      </div>
    </div>

    {showProfile && item.company?.id && (
      <CompanyProfileModal
        companyId={item.company.id}
        companyName={item.company.name}
        onClose={() => setShowProfile(false)}
      />
    )}
    </>
  );
};

export default CardTender;
