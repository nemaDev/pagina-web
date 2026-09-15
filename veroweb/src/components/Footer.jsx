export default function Footer({ onNavigate = () => {} }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-logo">
          BAJO MI<span>LENTE</span>
        </div>

        <p>Fotografía · Historias · Momentos</p>
      </div>

      <div className="footer-bottom">
        <span>by trabun digital</span>

        <div className="footer-links">
          <a href="https://instagram.com/bajo_milente" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://wa.me/56900000000" target="_blank" rel="noreferrer">WhatsApp</a>
          {/* <a href="https://behance.net" target="_blank" rel="noreferrer">Behance</a> */}
          <button type="button" className="footer-link-button" onClick={() => onNavigate("home")}>Inicio ↑</button>
        </div>
      </div>
    </footer>
  );
}
