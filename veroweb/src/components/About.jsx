export default function About() {
  return (
    <section className="about section" id="sobre-mi">
      <div className="about-image">
        <img
          src="https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=85"
          alt="Fotografía"
        />
      </div>

      <div className="about-content">
        <div className="section-label">04 — SOBRE MÍ</div>

        <h2>
          Detrás de
          <br />
          <em>la cámara.</em>
        </h2>

        <p>
          Soy fotógrafo enfocado en capturar momentos auténticos,
          especialmente aquellos donde la emoción ocurre de forma natural.
        </p>

        <p>
          Me interesa contar historias a través de imágenes, buscando que cada
          fotografía tenga personalidad propia.
        </p>

        <a href="#contacto" className="text-link">
          Hablemos de tu proyecto →
        </a>
      </div>
    </section>
  );
}
