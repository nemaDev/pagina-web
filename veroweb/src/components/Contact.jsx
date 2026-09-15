import { useState } from "react";

const initialForm = {
  nombre: "",
  email: "",
  proyecto: "",
  mensaje: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Enviando mensaje..." });

    try {
      const response = await fetch("https://formsubmit.co/ajax/vandriws@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email,
          _subject: `Nuevo proyecto: ${formData.proyecto || "Sin título"}`,
          message: `Nombre: ${formData.nombre}\nEmail: ${formData.email}\nProyecto: ${formData.proyecto}\n\nMensaje:\n${formData.mensaje}`,
          _captcha: "false",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar el mensaje");
      }

      setStatus({
        type: "success",
        message: "¡Mensaje enviado correctamente! Te responderé pronto.",
      });
      setFormData(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Hubo un problema al enviar el formulario. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <section className="contact section" id="contacto">
      <div className="contact-inner">
        <div className="section-label">05 — CONTACTO</div>

        <h2>
          ¿Tienes una
          <br />
          <em>idea?</em>
        </h2>

        <p>
          Cuéntame qué necesitas y conversemos sobre tu próximo proyecto
          fotográfico.
        </p>

        <div className="contact-layout">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-row">
              <label>
                <span>Nombre</span>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tuemail@email.com"
                  required
                />
              </label>
            </div>

            <label>
              <span>Tipo de proyecto</span>
              <input
                type="text"
                name="proyecto"
                value={formData.proyecto}
                onChange={handleChange}
                placeholder="Retrato, evento, deporte..."
              />
            </label>

            <label>
              <span>Mensaje</span>
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Cuéntame un poco más sobre tu idea..."
                rows="5"
                required
              />
            </label>

            <button
              type="submit"
              className="button button-light contact-submit"
              disabled={status.type === "loading"}
            >
              {status.type === "loading" ? "Enviando..." : "Enviar mensaje"}
            </button>

            {status.message && (
              <p
                className={
                  status.type === "success" ? "form-status success" : "form-status error"
                }
              >
                {status.message}
              </p>
            )}
          </form>

          <div className="contact-sidebar">
            <a href="mailto:vandriws@gmail.com" className="contact-email">
              vandriws@gmail.com
            </a>

            <div className="contact-socials">
              <a href="https://instagram.com/bajo_milente" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://wa.me/56900000000" target="_blank" rel="noreferrer">WhatsApp</a>
              {/* <a href="https://behance.net" target="_blank" rel="noreferrer">Behance</a> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
