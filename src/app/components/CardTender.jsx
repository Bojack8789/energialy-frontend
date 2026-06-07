"use client";
import { useEffect, useState } from "react";
import PaginationComp from "./Pagination";
import { useRouter } from "next/navigation";
import CompanyProfileModal from "@/app/components/CompanyProfileModal";

function FormattedString({ content }) {
  return <div dangerouslySetInnerHTML={{__html: content}}></div>;
}

const CardTender = ({item}) => {
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

  return (
    <>
    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 w-full mb-4 flex flex-col md:flex-row justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-primary-100 p-3 text-center align-baseline text-base font-bold leading-none text-primary-700">
            {item.company.name}
          </span>
          {item.company.id && (
            <button
              type="button"
              className="inline-block rounded bg-gray-100 border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={() => setShowProfile(true)}
            >
              Ver Perfil
            </button>
          )}
        </div>
        <h5 className="mb-2 text-xl font-semibold leading-tight text-neutral-800 dark:text-neutral-50">
          {item.title}
        </h5>
        <FormattedString content={item.description} />
        <div className="w-full mb-3 flex flex-wrap justify-start gap-2 sm:gap-3">
          {item.subcategories.map((sub, index) => (
            <span key={index} className="inline-block whitespace-nowrap rounded-full bg-neutral-200 px-2 py-1.5 sm:p-3 text-center align-baseline text-[0.70em] font-bold leading-none text-neutral-600">
              {sub.name}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="inline-block rounded bg-primary-800 px-4 sm:px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.1)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
          data-te-ripple-init
          data-te-ripple-color="light"
          onClick={() => router.push(`/tenders/${item.id}`)}
        >
          Ver Licitación
        </button>
      </div>
      <div className="w-full md:w-auto flex flex-row md:flex-col items-start md:items-center gap-2 sm:gap-3">
        {item.showBudget ? (
          <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-info-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-info-800">
            U$S: {item.budget}
          </span>
        ) : (
          <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-info-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-info-800">
            No disponible
          </span>
        )}
        {item.location && (
          <span
            className={`${
              item.location.id === "e8bbe98e-a725-44bb-b7d8-990013794f5c"
                ? "bg-success-100 text-success-700"
                : item.location.id === "9a83f3bb-0472-4e7e-bb67-9c8bdf996cd3"
                ? "bg-danger-500 text-danger-700"
                : "bg-info-800 text-info-700"
            } inline-block whitespace-nowrap rounded-[0.27rem]  px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none `}
          >
            {item.location.name}
          </span>
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
