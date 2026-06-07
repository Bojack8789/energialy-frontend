import CertificationCard from "./CertificationCard";

function CertificationCardContainer({ certification, openModal }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
      {certification.length > 0 ? (
        certification.map((file) => (
          <CertificationCard
            key={file.id}
            filesUrl={file.filesUrl}
            description={file.description}
            openModal={openModal}
          />
        ))
      ) : (
        <div className="col-span-2 text-center text-gray-400 py-8 text-sm">
          La empresa no tiene certificaciones/homologaciones cargadas.
        </div>
      )}
    </div>
  );
}

export default CertificationCardContainer;
