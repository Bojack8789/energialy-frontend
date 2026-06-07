import FilesCard from "./FilesCard";

function FilesCardContainer({ gallery, openModal, onDelete, onSaveDescription }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      {gallery.map((item) => (
        <FilesCard
          key={item.id}
          imageUrl={item.imageUrl}
          id={item.id}
          description={item.description}
          openModal={openModal}
          onDelete={onDelete}
          onSaveDescription={onSaveDescription}
          canEdit={true}
        />
      ))}
    </div>
  );
}

export default FilesCardContainer;
