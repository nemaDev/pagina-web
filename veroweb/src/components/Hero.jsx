export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-background" />

      <div className="hero-content">
        <p className="eyebrow">FOTOGRAFÍA · BAJO MI LENTE</p>

        <h1>
          Momentos que
          <br />
          <em>merecen ser recordados.</em>
        </h1>

        <p className="hero-description">
          Fotografía deportiva, retratos y eventos. Capturo historias,
          emociones y momentos que permanecen en el tiempo.
        </p>

        <div className="hero-buttons">
          <a href="#portfolio" className="button button-light">
            Ver portafolio
          </a>

          <a href="#contacto" className="button button-outline">
            Contáctame
          </a>
        </div>
      </div>

      <div className="scroll-indicator">
        <span></span>
        <p>SCROLL</p>
      </div>
    </section>
  );
}
