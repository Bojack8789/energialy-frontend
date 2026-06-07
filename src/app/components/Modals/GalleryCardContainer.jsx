import GalleryCard from "./GalleryImageCard";

function GalleryCardContainer({ gallery, openModal }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
      {gallery.length > 0 ? (
        gallery.map((image) => (
          <GalleryCard
            key={image.id}
            imageUrl={image.imageUrl}
            description={image.description}
            openModal={openModal}
          />
        ))
      ) : (
        <div className="col-span-2 text-center text-gray-400 py-8 text-sm">
          La empresa no tiene productos/servicios cargados.
        </div>
      )}
    </div>
  );
}

export default GalleryCardContainer;
