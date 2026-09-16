
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Portfolio from "./components/Portfolio";
import Services from "./components/Services";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";
import { DEFAULT_CATEGORIES } from "./data/categories";

const STORAGE_KEY = "bajo-mi-lente-portfolio";
const CATEGORIES_STORAGE_KEY = "bajo-mi-lente-categories";
const CATEGORY_VISIBILITY_STORAGE_KEY = "bajo-mi-lente-category-visibility";
const USER_EMAILS_STORAGE_KEY = "bajo-mi-lente-user-emails";
const ADMIN_LOGIN_KEY = "bajo-mi-lente-admin-auth";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "bajomilente";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const isAdminPath = (path = "") => {
  const currentPath = (path || (typeof window !== "undefined" ? window.location.pathname : "") || "").toLowerCase();
  return ["/web/admin", "/web/admin/", "/admin", "/admin/"].includes(currentPath);
};

const defaultPortfolio = [
  {
    id: "deportes-futbol",
    category: "Deportes",
    title: "Fútbol en acción",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: "deportes-entrenamiento",
    category: "Deportes",
    title: "Entrenamiento",
    image:
      "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: "deportes-velocidad",
    category: "Deportes",
    title: "Velocidad",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: "retratos-intimo",
    category: "Retratos",
    title: "Retrato íntimo",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "retratos-mirada",
    category: "Retratos",
    title: "Mirada",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "retratos-natural",
    category: "Retratos",
    title: "Retrato natural",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "eventos-recepcion",
    category: "Eventos",
    title: "Recepción",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: "eventos-boda",
    category: "Eventos",
    title: "Boda",
    image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: "eventos-celebracion",
    category: "Eventos",
    title: "Celebración",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: "automotriz-detalle",
    category: "Automotriz",
    title: "Detalle",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: "automotriz-garage",
    category: "Automotriz",
    title: "Garage",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: "automotriz-linea",
    category: "Automotriz",
    title: "Línea",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=85",
  },
];

const normalizePortfolio = (items) =>
  items.map((item, index) => ({
    ...item,
    id: item.id || `${item.category}-${item.title || "item"}-${index}`,
    mediaType: item.mediaType === "video" ? "video" : "image",
    visible: item.visible !== false,
  }));

const getInitialPortfolio = () => {
  if (typeof window === "undefined") {
    return defaultPortfolio;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return defaultPortfolio;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? normalizePortfolio(parsed) : defaultPortfolio;
  } catch {
    return defaultPortfolio;
  }
};

const getInitialCategories = () => {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;

  const saved = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
  const savedPortfolio = window.localStorage.getItem(STORAGE_KEY);
  let portfolioCategories = [];

  try {
    const parsedPortfolio = savedPortfolio ? JSON.parse(savedPortfolio) : [];
    portfolioCategories = Array.isArray(parsedPortfolio)
      ? parsedPortfolio.map((item) => item.category).filter(Boolean)
      : [];
  } catch {
    portfolioCategories = [];
  }

  if (!saved) return [...new Set([...DEFAULT_CATEGORIES, ...portfolioCategories])];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length
      ? [...new Set([
          ...parsed.filter((category) => typeof category === "string" && category.trim()),
          ...portfolioCategories,
        ])]
      : [...new Set([...DEFAULT_CATEGORIES, ...portfolioCategories])];
  } catch {
    return [...new Set([...DEFAULT_CATEGORIES, ...portfolioCategories])];
  }
};

const getInitialCategoryVisibility = () => {
  if (typeof window === "undefined") return {};

  try {
    const saved = JSON.parse(window.localStorage.getItem(CATEGORY_VISIBILITY_STORAGE_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};

const getInitialUserEmails = () => {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(window.localStorage.getItem(USER_EMAILS_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((email) => typeof email === "string") : [];
  } catch {
    return [];
  }
};

const mapSupabaseCategories = (rows = []) => {
  const visible = {};
  const names = rows
    .sort((first, second) => (first.order_index || 0) - (second.order_index || 0))
    .map((row) => {
      visible[row.name] = row.visible !== false;
      return row.name;
    })
    .filter(Boolean);

  return { names, visible };
};

const mapSupabaseRows = (rows = []) =>
  normalizePortfolio(
    rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      image: row.image,
      mediaType: row.media_type,
      visible: row.visible,
    }))
  );

const fetchPortfolioFromSupabase = async () => {
  if (!supabaseClient) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from("portfolio_items")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.warn("No se pudo cargar el portafolio desde Supabase:", error.message);
    return null;
  }

  return data ? mapSupabaseRows(data) : null;
};

const savePortfolioToSupabase = async (items) => {
  if (!supabaseClient) {
    return;
  }

  const { error: deleteError } = await supabaseClient
    .from("portfolio_items")
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    console.warn("No se pudieron sincronizar las eliminaciones del portafolio:", deleteError.message);
    return;
  }

  const rows = items.map((item, index) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    image: item.image,
    media_type: item.mediaType || "image",
    visible: item.visible !== false,
    order_index: index,
  }));

  const { error } = rows.length
    ? await supabaseClient.from("portfolio_items").upsert(rows, { onConflict: "id" })
    : { error: null };

  if (error) {
    console.warn("No se pudo guardar el portafolio en Supabase:", error.message);
  }
};

const fetchCategoriesFromSupabase = async () => {
  if (!supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from("portfolio_categories")
    .select("name, visible, order_index")
    .order("order_index", { ascending: true });

  if (error) {
    console.warn("No se pudieron cargar las categorías desde Supabase:", error.message);
    return null;
  }

  return data ? mapSupabaseCategories(data) : null;
};

const saveCategoriesToSupabase = async (categories, categoryVisibility) => {
  if (!supabaseClient) return;

  const { error: deleteError } = await supabaseClient
    .from("portfolio_categories")
    .delete()
    .not("name", "is", null);

  if (deleteError) {
    console.warn("No se pudieron sincronizar las eliminaciones de categorías:", deleteError.message);
    return;
  }

  const rows = categories.map((name, index) => ({
    name,
    visible: categoryVisibility[name] !== false,
    order_index: index,
  }));

  const { error } = rows.length
    ? await supabaseClient.from("portfolio_categories").upsert(rows, { onConflict: "name" })
    : { error: null };

  if (error) {
    console.warn("No se pudieron guardar las categorías en Supabase:", error.message);
  }
};

const fetchUserEmailsFromSupabase = async () => {
  if (!supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from("admin_users")
    .select("email")
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("No se pudieron cargar los usuarios desde Supabase:", error.message);
    return null;
  }

  return (data || []).map((row) => row.email).filter(Boolean);
};

const saveUserEmailsToSupabase = async (emails) => {
  if (!supabaseClient) return;

  const { error: deleteError } = await supabaseClient
    .from("admin_users")
    .delete()
    .not("email", "is", null);

  if (deleteError) {
    console.warn("No se pudieron actualizar los usuarios en Supabase:", deleteError.message);
    return;
  }

  if (!emails.length) return;

  const { error } = await supabaseClient
    .from("admin_users")
    .upsert(emails.map((email) => ({ email })), { onConflict: "email" });

  if (error) {
    console.warn("No se pudieron guardar los usuarios en Supabase:", error.message);
  }
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(getInitialPortfolio);
  const [categories, setCategories] = useState(getInitialCategories);
  const [categoryVisibility, setCategoryVisibility] = useState(getInitialCategoryVisibility);
  const [userEmails, setUserEmails] = useState(getInitialUserEmails);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const hasLoadedRemotePortfolio = useRef(false);
  const hasLoadedRemoteCategories = useRef(false);
  const hasLoadedRemoteUsers = useRef(false);
  const [isAdminRoute, setIsAdminRoute] = useState(() =>
    typeof window !== "undefined" ? isAdminPath(window.location.pathname) : false
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(ADMIN_LOGIN_KEY) === "true";
  });
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch (error) {
      console.warn("No se pudo guardar el portafolio en localStorage:", error);
    }
  }, [portfolio]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.warn("No se pudieron guardar las categorías en localStorage:", error);
    }
  }, [categories]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        CATEGORY_VISIBILITY_STORAGE_KEY,
        JSON.stringify(categoryVisibility)
      );
    } catch (error) {
      console.warn("No se pudo guardar la visibilidad de las categorías:", error);
    }
  }, [categoryVisibility]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_EMAILS_STORAGE_KEY, JSON.stringify(userEmails));
  }, [userEmails]);

  useEffect(() => {
    let active = true;

    const loadRemotePortfolio = async () => {
      if (!supabaseClient) return;

      const remotePortfolio = await fetchPortfolioFromSupabase();
      if (!active || !remotePortfolio) return;

      if (remotePortfolio.length) setPortfolio(remotePortfolio);
      hasLoadedRemotePortfolio.current = true;
    };

    loadRemotePortfolio();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadRemoteUsers = async () => {
      const remoteUsers = await fetchUserEmailsFromSupabase();
      if (!active || !remoteUsers) return;

      if (remoteUsers.length) setUserEmails(remoteUsers);
      hasLoadedRemoteUsers.current = true;
    };

    loadRemoteUsers();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadRemoteCategories = async () => {
      const remoteCategories = await fetchCategoriesFromSupabase();
      if (!active || !remoteCategories) return;

      if (remoteCategories.names.length) {
        setCategories(remoteCategories.names);
        setCategoryVisibility(remoteCategories.visible);
      }
      hasLoadedRemoteCategories.current = true;
    };

    loadRemoteCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabaseClient || !hasLoadedRemotePortfolio.current) return;

    savePortfolioToSupabase(portfolio);
  }, [portfolio]);

  useEffect(() => {
    if (!supabaseClient || !hasLoadedRemoteCategories.current) return;

    saveCategoriesToSupabase(categories, categoryVisibility);
  }, [categories, categoryVisibility]);

  useEffect(() => {
    if (!supabaseClient || !hasLoadedRemoteUsers.current) return;

    saveUserEmailsToSupabase(userEmails);
  }, [userEmails]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    const handleRouteChange = () => {
      const nextRoute = isAdminPath(window.location.pathname);
      setIsAdminRoute(nextRoute);
      if (!nextRoute) {
        setLoginError("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("popstate", handleRouteChange);
    handleRouteChange();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(ADMIN_LOGIN_KEY, isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  useEffect(() => {
    if (!supabaseClient) return;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) setIsAuthenticated(true);
    });
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPublicSite = () => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/");
      setIsAdminRoute(false);
    }
  };

  const goToAdminRoute = () => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/admin");
      setIsAdminRoute(true);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const email = loginData.username.trim().toLowerCase();

    if (
      authMode === "login" &&
      loginData.username.trim() === ADMIN_USERNAME &&
      loginData.password === ADMIN_PASSWORD
    ) {
      setIsAuthenticated(true);
      setLoginError("");
      setAuthNotice("");
      goToAdminRoute();
      return;
    }

    if (authMode === "forgot") {
      if (!email || !email.includes("@")) {
        setLoginError("Escribe el correo con el que creaste tu cuenta.");
        return;
      }

      if (!supabaseClient) {
        setLoginError("La recuperación por correo requiere configurar Supabase.");
        return;
      }

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });

      if (error) {
        setLoginError("No se pudo enviar el correo de recuperación. Comprueba el email e inténtalo de nuevo.");
        return;
      }

      setLoginError("");
      setAuthNotice(`Si existe una cuenta para ${email}, recibirás un enlace para crear una nueva contraseña.`);
      setAuthMode("login");
      return;
    }

    if (supabaseClient) {
      if (
        authMode === "login" &&
        !userEmails.some((registeredEmail) => registeredEmail.toLowerCase() === email)
      ) {
        setLoginError("Este correo no tiene acceso al panel. Pide al administrador que lo autorice en Usuarios.");
        return;
      }

      const result = await supabaseClient.auth.signInWithPassword({
        email,
        password: loginData.password,
      });

      if (result.error) {
        const message = result.error.message.toLowerCase();
        const isEmailRateLimited = message.includes("email rate limit") || message.includes("rate limit exceeded");
        const errorMessage = isEmailRateLimited
          ? "Supabase ha limitado temporalmente los correos de registro. Espera unos minutos antes de intentarlo de nuevo o configura un proveedor SMTP en Supabase."
          : message.includes("already registered") || message.includes("already been registered")
            ? "Este correo ya tiene una cuenta. Intenta iniciar sesión."
            : message.includes("invalid email")
              ? "El correo electrónico no es válido."
              : message.includes("password")
                ? "La contraseña no cumple los requisitos mínimos."
                : `No se pudo completar el acceso: ${result.error.message}`;

        setLoginError(errorMessage);
        if (isEmailRateLimited) {
          setAuthMode("login");
        }
        return;
      }

      setIsAuthenticated(true);
      setLoginError("");
      setAuthNotice("");
      goToAdminRoute();
      return;
    }

    setLoginError("Usuario o contraseña incorrectos.");
  };

  const handleLogout = () => {
    if (supabaseClient) supabaseClient.auth.signOut();
    setIsAuthenticated(false);
    setLoginError("");
    goToPublicSite();
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="site">
      {!isAdminRoute && (
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} closeMenu={closeMenu} />
      )}

      <main>
        {isAdminRoute ? (
          isAuthenticated ? (
            <AdminPanel
              items={portfolio}
              setItems={setPortfolio}
              categories={categories}
              setCategories={setCategories}
              categoryVisibility={categoryVisibility}
              setCategoryVisibility={setCategoryVisibility}
              userEmails={userEmails}
              setUserEmails={setUserEmails}
              onClose={handleLogout}
            />
          ) : (
            <section className="admin-login-screen">
              <form className="admin-login-card" onSubmit={handleLogin}>
                <div className="section-label">ACCESO RESTRINGIDO</div>
                <h2>{authMode === "login" ? "Panel de administración" : "Recuperar acceso"}</h2>

                <label>
                  <span>{authMode === "login" ? "Correo o usuario" : "Correo electrónico"}</span>
                  <input
                    type="text"
                    name="username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    placeholder={authMode === "login" ? "admin o tu@correo.com" : "tu@correo.com"}
                    autoComplete={authMode === "login" ? "username" : "email"}
                    required
                  />
                </label>

                {authMode !== "forgot" && (
                  <label>
                    <span>Contraseña</span>
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      minLength={6}
                      required
                    />
                  </label>
                )}

                {authNotice && <p className="admin-login-notice">{authNotice}</p>}
                {loginError && <p className="admin-login-error">{loginError}</p>}

                <button type="submit" className="button button-light">
                  {authMode === "login" ? "Entrar" : "Enviar enlace"}
                </button>
                {authMode === "login" && (
                  <button
                    type="button"
                    className="admin-auth-switch"
                    onClick={() => {
                      setAuthMode("forgot");
                      setLoginError("");
                      setAuthNotice("");
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
                {authMode === "forgot" && (
                  <button
                    type="button"
                    className="admin-auth-switch"
                    onClick={() => {
                      setAuthMode("login");
                      setLoginError("");
                      setAuthNotice("");
                    }}
                  >
                    Volver a iniciar sesión
                  </button>
                )}
              </form>
            </section>
          )
        ) : (
          <>
            <Hero items={portfolio} />
            <Portfolio
              items={portfolio}
              categories={categories}
              categoryVisibility={categoryVisibility}
            />
            <Services />
            <About />
            <Contact />
          </>
        )}
      </main>

      {!isAdminRoute && <Footer />}

      {!isAdminRoute && showScrollTop && (
        <button type="button" className="scroll-top" onClick={scrollToTop} aria-label="Subir arriba">
          ↑
        </button>
      )}
    </div>
  );
}

export default App;
