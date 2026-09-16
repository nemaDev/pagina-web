import { useMemo, useState } from "react";

function Portfolio({ items = [], categories = [], categoryVisibility = {} }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeSubtype, setActiveSubtype] = useState("Todos");

  const categoryCards = useMemo(
    () =>
      categories
        .filter((category) => categoryVisibility[category] !== false)
        .map((category) => {
          const categoryItems = items.filter(
            (item) => item.category === category && item.visible !== false
          );
          return {
            id: category,
            name: category,
            cover: categoryItems[0]?.image || "",
            mediaType: categoryItems[0]?.mediaType || "image",
            count: categoryItems.length,
          };
        }),
    [categories, categoryVisibility, items]
  );

  const currentCategoryItems = useMemo(
    () => (selectedCategory
      ? items.filter(
          (item) => item.category === selectedCategory && item.visible !== false
        )
      : []),
    [items, selectedCategory]
  );

  const subtypes = useMemo(() => {
    if (!currentCategoryItems.length) return ["Todos"];
    const uniqueTitles = [...new Set(currentCategoryItems.map((item) => item.title))];
    return ["Todos", ...uniqueTitles];
  }, [currentCategoryItems]);

  const visibleItems =
    !selectedCategory || activeSubtype === "Todos"
      ? currentCategoryItems
      : currentCategoryItems.filter((item) => item.title === activeSubtype);

  const currentImageIndex = selectedImage
    ? visibleItems.findIndex((item) => item.id === selectedImage.id)
    : -1;

  const showPreviousImage = () => {
    if (!visibleItems.length || currentImageIndex <= 0) return;
    setSelectedImage(visibleItems[currentImageIndex - 1]);
  };

  const showNextImage = () => {
    if (!visibleItems.length || currentImageIndex === -1 || currentImageIndex >= visibleItems.length - 1) return;
    setSelectedImage(visibleItems[currentImageIndex + 1]);
  };

  const openCategory = (category) => {
    setSelectedCategory(category);
    setSelectedImage(null);
    setActiveSubtype("Todos");
    setTimeout(() => {
      const target = document.getElementById("portfolio-detail");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 10);
  };

  const closeCategory = () => {
    setSelectedCategory(null);
    setSelectedImage(null);
    setActiveSubtype("Todos");
  };

  return (
    <section className="portfolio section" id="portfolio">
      <div className="section-header">
        <div className="section-label">PORTAFOLIO</div>
        <h2>
          Selección de <em>trabajos</em>
        </h2>
      </div>

      {!selectedCategory ? (
        <>
          <div className="portfolio-grid portfolio-category-grid" id="portfolio-gallery">
            {categoryCards.map((category) => (
              <article
                className="portfolio-card portfolio-category-card"
                key={category.id}
                onClick={() => openCategory(category.id)}
              >
                {category.mediaType === "video" ? (
                  <video src={category.cover} muted playsInline preload="metadata" />
                ) : (
                  <img src={category.cover} alt={category.name} loading="lazy" />
                )}

                <div className="portfolio-overlay">
                  <div>
                    <span>{category.count} proyectos</span>
                    <h3>{category.name}</h3>
                  </div>

                  <span className="portfolio-arrow">↗</span>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="portfolio-detail" id="portfolio-detail">
          <div className="portfolio-detail-header">
            <button type="button" className="portfolio-back" onClick={closeCategory}>
              ← Volver al portafolio
            </button>
            <div className="section-label">{selectedCategory}</div>
            <h3>
              Colección de <em>{selectedCategory}</em>
            </h3>
          </div>

          <div className="portfolio-subfilters">
            {subtypes.map((subtype) => (
              <button
                key={subtype}
                type="button"
                className={`portfolio-subfilter ${activeSubtype === subtype ? "active" : ""}`}
                onClick={() => setActiveSubtype(subtype)}
              >
                {subtype}
              </button>
            ))}
          </div>

          <div className="portfolio-detail-grid">
            {visibleItems.map((item, index) => (
              <button
                type="button"
                className="portfolio-detail-card interactive"
                key={`${item.title}-detail-${index}`}
                onClick={() => setSelectedImage(item)}
                aria-label={`Abrir imagen ${item.title}`}
              >
                {item.mediaType === "video" ? (
                  <video src={item.image} muted playsInline preload="metadata" />
                ) : (
                  <img src={item.image} alt={item.title} loading="lazy" />
                )}
                <div className="portfolio-detail-info">
                  <span>{item.category}</span>
                  <strong>{item.title}</strong>
                </div>
              </button>
            ))}
          </div>

          {selectedImage && (
            <div className="portfolio-lightbox" role="dialog" aria-modal="true">
              <div className="portfolio-lightbox-backdrop" onClick={() => setSelectedImage(null)} />
              <div className="portfolio-lightbox-content">
                <button
                  type="button"
                  className="portfolio-lightbox-close"
                  onClick={() => setSelectedImage(null)}
                  aria-label="Cerrar imagen"
                >
                  ✕
                </button>

                <div className="portfolio-lightbox-nav">
                  <button
                    type="button"
                    className="portfolio-lightbox-arrow"
                    onClick={showPreviousImage}
                    disabled={currentImageIndex <= 0}
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="portfolio-lightbox-arrow"
                    onClick={showNextImage}
                    disabled={currentImageIndex === -1 || currentImageIndex >= visibleItems.length - 1}
                    aria-label="Siguiente imagen"
                  >
                    ›
                  </button>
                </div>

                <div className="portfolio-lightbox-media">
                  {selectedImage.mediaType === "video" ? (
                    <video src={selectedImage.image} controls autoPlay playsInline />
                  ) : (
                    <img src={selectedImage.image} alt={selectedImage.title} />
                  )}
                </div>
                <div className="portfolio-lightbox-copy">
                  <span>{selectedImage.category}</span>
                  <h4>{selectedImage.title}</h4>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Portfolio;