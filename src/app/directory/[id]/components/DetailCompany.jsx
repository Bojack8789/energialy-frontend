import Image from "next/image";
import placeholder from "@/app/assets/placeholder.jpg";
import Chat from "@/app/components/Chat";

function dateTransform(string) {
  if (!string) return "Fecha no disponible";
  const formatDate = new Date(string);
  const optionsDate = { year: "numeric", month: "long", day: "numeric" };
  const date = formatDate.toLocaleDateString(undefined, optionsDate);
  return date;
}

function DetailCompany({company}) {
  // Si no hay datos de empresa, crear datos de ejemplo
  const defaultCompany = {
    name: "Empresa Ejemplo",
    profilePicture: placeholder,
    createdAt: new Date().toISOString(),
    foundationYear: "2020",
    annualRevenue: "$1,000,000",
    description: "Esta es una descripción de ejemplo para la empresa. Aquí se mostraría información detallada sobre los servicios, historia y valores de la compañía.",
    locations: [{ id: 1, name: "Ciudad Ejemplo" }],
    categories: [{ id: 1, name: "Categoría Ejemplo" }],
    subcategories: [{ id: 1, name: "Subcategoría Ejemplo" }]
  };
  
  const companyData = company || defaultCompany;
  const date = dateTransform(companyData.createdAt);
    
  return (
    <>
      <div className="flex flex-col md:flex-row mt-2 pt-8 border-t-2">
        {/* Columna 1: Logo, nombre y datos */}
        <div className="flex flex-col justify-start align-middle w-full md:w-1/2 px-4">
          <div className="w-full flex justify-center md:justify-start mb-4">
            <Image
              src={companyData.profilePicture || placeholder}
              width={200}
              height={200}
              alt={companyData.name || "Logo de la empresa"}
            />
          </div>
          <div className="text-center md:text-left p-3">
            <h2 className="text-xl md:text-2xl font-bold">{companyData.name}</h2>
          </div>
          <div className="text-sm mb-2">
            <p>Miembro desde, {date}</p>
          </div>
          <div className="mb-2">
            <p className="text-sm">
              <span className="font-bold">Año Fundación:</span>{" "}
              {companyData.foundationYear || "No disponible"}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-sm">
              <span className="font-bold">Ingresos Ultimo Año:</span>{" "}
              {companyData.annualRevenue || "No disponible"}
            </p>
          </div>
          
          {/* Ubicaciones */}
          <div className="flex flex-wrap mb-4">
            <p className="font-bold text-sm w-full mb-2">Ubicaciones:</p>
            {companyData.locations && companyData.locations.length > 0 ? (
              companyData.locations.map((location) => (
                <div key={location.id} className="flex mr-4 mb-2">
                  <div className="w-2 h-2 bg-primary-200 rounded-full mr-1 mt-1"></div>
                  <p className="text-sm">{location.name}</p>
                </div>
              ))
            ) : (
              <p className="text-sm">No hay ubicaciones disponibles</p>
            )}
          </div>
          
          {/* Categorías */}
          <div className="mb-4">
            <p className="font-bold text-sm mb-2">Categorías:</p>
            <div className="flex flex-wrap">
              {companyData.categories && companyData.categories.length > 0 ? (
                companyData.categories.map((category) => (
                  <div key={category.id} className="flex mr-4 mb-2">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2 mt-1"></div>
                    <p className="text-sm font-semibold">{category.name}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm">No hay categorías disponibles</p>
              )}
            </div>
          </div>
          
          {/* Subcategorías */}
          <div className="mb-4">
            <p className="font-bold text-sm mb-2">Sub-Categorías:</p>
            <div className="flex flex-wrap">
              {companyData.subcategories && companyData.subcategories.length > 0 ? (
                companyData.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="flex mr-4 mb-2">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2 mt-1"></div>
                    <p className="text-sm font-semibold">{subcategory.name}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm">No hay subcategorías disponibles</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Columna 2: Descripción de la empresa */}
        <div className="w-full md:w-1/2 flex flex-col px-4 mt-4 md:mt-0">
          <h3 className="font-bold text-lg mb-4">Descripción de la Empresa</h3>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
            <p className="text-sm text-justify">
              {companyData.description || "No hay descripción disponible para esta empresa."}
            </p>
          </div>
          
          {/* Chat integrado */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">
              💬 Chat con {companyData.name}
            </h3>
            <div className="h-[500px] flex flex-col">
              <Chat id={companyData.id} company={companyData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DetailCompany