import { useEffect, useState } from "react";

const heroBackgrounds = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2200&q=90",
];

export default function Hero() {
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBackgroundIndex((current) => (current + 1) % heroBackgrounds.length);
    }, 8000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero" id="inicio">
      <div
        className="hero-background"
        style={{ "--hero-image": `url(${heroBackgrounds[backgroundIndex]})` }}
        aria-hidden="true"
      />

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
