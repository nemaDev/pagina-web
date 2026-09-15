const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Portafolio", href: "#portfolio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar({
  menuOpen = false,
  setMenuOpen = () => {},
  closeMenu = () => {},
}) {
  return (
    <header className="navbar">
      <a href="#inicio" className="logo" onClick={closeMenu}>
        BAJO MI<span>LENTE</span>
      </a>

      <nav className={menuOpen ? "nav-links active" : "nav-links"}>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={closeMenu}>
            {item.label}
          </a>
        ))}
      </nav>

      <button
        className="menu-button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Abrir menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}
