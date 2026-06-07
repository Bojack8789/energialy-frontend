import FilesCard from "./FilesCard";

function FilesCardContainer({ certification, openModal, onDelete, onSaveDescription }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      {certification.map((item) => (
        <FilesCard
          key={item.id}
          imageUrl={item.filesUrl}
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
