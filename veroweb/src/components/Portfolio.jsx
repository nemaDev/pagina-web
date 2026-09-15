import { useState } from "react";

const categories = [
  { id: "todos", name: "Todos" },
  { id: "Deportes", name: "Deportes" },
  { id: "Retratos", name: "Retratos" },
  { id: "Eventos", name: "Eventos" },
  { id: "Automotriz", name: "Automotriz" },
];

function Portfolio({ items = [] }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const visibleItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  const openCategory = (category) => {
    setSelectedCategory(category);
    setTimeout(() => {
      const target = document.getElementById("portfolio-detail");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 10);
  };

  return (
    <section className="portfolio section" id="portfolio">
      <div className="section-header">
        <div className="section-label">02 — TRABAJO</div>
        <h2>
          Selección de <em>trabajos</em>
        </h2>
      </div>

      {!selectedCategory ? (
        <>
          <div className="portfolio-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="portfolio-filter"
                onClick={() => openCategory(category.id === "todos" ? "Deportes" : category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="portfolio-grid" id="portfolio-gallery">
            {items.map((item, index) => (
              <article
                className="portfolio-card"
                key={`${item.title}-${index}`}
                onClick={() => openCategory(item.category)}
              >
                <img src={item.image} alt={item.title} loading="lazy" />

                <div className="portfolio-overlay">
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
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
            <button type="button" className="portfolio-back" onClick={() => setSelectedCategory(null)}>
              ← Volver al portafolio
            </button>
            <div className="section-label">{selectedCategory}</div>
            <h3>
              Colección de <em>{selectedCategory}</em>
            </h3>
          </div>

          <div className="portfolio-detail-grid">
            {visibleItems.map((item, index) => (
              <div className="portfolio-detail-card" key={`${item.title}-detail-${index}`}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="portfolio-detail-info">
                  <span>{item.category}</span>
                  <strong>{item.title}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Portfolio;