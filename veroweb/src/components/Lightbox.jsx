function Lightbox({
  photos,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}) {
  const photo = photos[currentIndex];

  if (!photo) {
    return null;
  }

  return (
    <div
      className="lightbox"
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Cerrar"
      >
        ×
      </button>

      <button
        type="button"
        className="lightbox-prev"
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
        aria-label="Fotografía anterior"
      >
        ‹
      </button>

      <div
        className="lightbox-content"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <img
          src={photo.image}
          alt={photo.title}
        />

        <div className="lightbox-info">
          <span>{photo.category}</span>
          <strong>{photo.title}</strong>
        </div>
      </div>

      <button
        type="button"
        className="lightbox-next"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label="Fotografía siguiente"
      >
        ›
      </button>
    </div>
  );
}

export default Lightbox;