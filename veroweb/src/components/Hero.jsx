import { useEffect, useMemo, useState } from "react";
import { getVideoPoster } from "../utils/media";

const heroBackgrounds = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2200&q=90",
];

function Hero({ items = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = useMemo(() => {
    const portfolioSlides = items
      .filter((item) => item.visible !== false && item.carouselVisible !== false && item.image)
      .slice(0, 6)
      .map((item) => ({
        src: item.image,
        type: item.mediaType === "video" ? "video" : "image",
        poster: item.poster,
        label: item.category,
        title: item.title,
      }));

    if (portfolioSlides.length) return portfolioSlides;

    return heroBackgrounds.map((src, index) => ({
      src,
      type: "image",
      label: "Bajo mi lente",
      title: `Historias ${String(index + 1).padStart(2, "0")}`,
    }));
  }, [items]);

  useEffect(() => {
    if (isPaused || slides.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  const safeActiveIndex = activeIndex < slides.length ? activeIndex : 0;
  const activeSlide = slides[safeActiveIndex];
  const showPrevious = () => setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <section
      className="hero"
      id="inicio"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="hero-background"
        key={`${activeSlide.src}-${safeActiveIndex}`}
        aria-hidden="true"
      >
        {activeSlide.type === "video" ? (
          <video
            src={activeSlide.src}
            autoPlay
            muted
            loop
            playsInline
            poster={getVideoPoster(activeSlide.src, activeSlide.poster)}
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            draggable="false"
          />
        ) : (
          <img src={activeSlide.src} alt="" draggable="false" />
        )}
      </div>

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

        <div className="hero-slide-caption" aria-live="polite">
          <span>{activeSlide.label}</span>
          <strong>{activeSlide.title}</strong>
        </div>

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

      {slides.length > 1 && (
        <div className="hero-carousel-controls" aria-label="Controles del carrusel">
          <button type="button" onClick={showPrevious} aria-label="Slide anterior">←</button>
          <div className="hero-carousel-progress">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={`${slide.src}-${index}`}
                className={index === safeActiveIndex ? "active" : ""}
                onClick={() => setActiveIndex(index)}
                aria-label={`Mostrar slide ${index + 1}`}
              />
            ))}
          </div>
          <button type="button" onClick={showNext} aria-label="Siguiente slide">→</button>
        </div>
      )}
    </section>
  );
}

export default Hero;
