const services = [
  {
    number: "01",
    title: "Fotografía deportiva",
    description: "Cobertura de partidos, torneos y eventos deportivos.",
  },
  {
    number: "02",
    title: "Retratos",
    description: "Retratos individuales, sesiones personales y profesionales.",
  },
  {
    number: "03",
    title: "Eventos",
    description: "Registro fotográfico de eventos y ocasiones especiales.",
  },
  {
    number: "04",
    title: "Sesiones personalizadas",
    description: "Una sesión diseñada según tu idea y necesidades.",
  },
];

export default function Services() {
  return (
    <section className="services section" id="servicios">
      <div className="section-label">03 — SERVICIOS</div>

      <div className="services-header">
        <h2>
          Lo que <em>hago.</em>
        </h2>

        <p>
          Servicios fotográficos pensados para capturar tus momentos más
          importantes.
        </p>
      </div>

      <div className="services-list">
        {services.map((service) => (
          <div className="service" key={service.number}>
            <span className="service-number">{service.number}</span>

            <div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>

            <span className="service-arrow">↗</span>
          </div>
        ))}
      </div>
    </section>
  );
}
