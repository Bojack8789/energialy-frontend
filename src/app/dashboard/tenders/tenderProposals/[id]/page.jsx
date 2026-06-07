'use client'
import { useGetTenderByIdQuery } from "@/app/redux/services/tendersApi";
import getLocalStorage from "@/app/Func/localStorage";
import { useRouter } from "next/navigation";
import ProposalsTable from "@/app/components/ProposalsTable";

function Page({params}) {
  const { data:tender, isLoading, isError, refetch } = useGetTenderByIdQuery(params.id);
  const userData = getLocalStorage();
  const router = useRouter();

  const backPage = () => {
    router.back()
  }

  const handleRefresh = () => {
    refetch();
  }

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando propuestas...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <h3 className="text-red-800 font-semibold mb-2">Error al cargar la licitación</h3>
          <p className="text-red-600">Por favor, intenta nuevamente.</p>
          <button
            onClick={backPage}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-4 py-2"
          >
            Volver
          </button>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
          {/* Header con información de la licitación */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {tender.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Presupuesto:</span>{" "}
                    <span className="text-green-600 font-bold">
                      U$S {tender.budget?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Vencimiento:</span>{" "}
                    {tender.validityDate}
                  </div>
                  <div>
                    <span className="font-semibold">Estado:</span>{" "}
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      tender.status === 'published' ? 'bg-green-100 text-green-800' :
                      tender.status === 'working' ? 'bg-blue-100 text-blue-800' :
                      tender.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tender.status === 'published' ? 'Publicada' :
                       tender.status === 'working' ? 'En Trabajo' :
                       tender.status === 'completed' ? 'Completada' :
                       tender.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={backPage}
                className="mt-4 md:mt-0 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md px-6 py-2 transition-colors"
              >
                Volver
              </button>
            </div>

            {tender.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-semibold mb-2">Descripción:</p>
                <p className="text-gray-700">{tender.description}</p>
              </div>
            )}
          </div>

          {/* Título de la sección */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Propuestas Recibidas
            </h2>
            <p className="text-gray-600">
              Total de propuestas: <span className="font-semibold">{tender.proposals?.length || 0}</span>
            </p>
          </div>

          {/* Tabla de propuestas */}
          <ProposalsTable
            proposals={tender.proposals || []}
            tenderInfo={tender}
            onRefresh={handleRefresh}
          />
        </div>
      )}
    </>
  );
}

export default Page
