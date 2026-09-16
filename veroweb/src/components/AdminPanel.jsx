import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CATEGORIES } from "../data/categories";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const defaultForm = {
  category: DEFAULT_CATEGORIES[0],
  title: "",
  image: "",
  mediaType: "image",
  carouselVisible: true,
};

function AdminPanel({
  items = [],
  setItems = () => {},
  categories = DEFAULT_CATEGORIES,
  setCategories = () => {},
  categoryVisibility = {},
  setCategoryVisibility = () => {},
  userEmails = [],
  setUserEmails = () => {},
  onClose = () => {},
}) {
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const [notice, setNotice] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryNotice, setCategoryNotice] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [categoryToRename, setCategoryToRename] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameNotice, setRenameNotice] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [userNotice, setUserNotice] = useState("");
  const formRef = useRef(null);
  const titleInputRef = useRef(null);

  const availableCategories = useMemo(
    () => [...new Set([...categories, ...items.map((item) => item.category).filter(Boolean)])],
    [categories, items]
  );

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter = filter === "Todos" || item.category === filter;
      const matchesSearch =
        !normalizedSearch ||
        (item.title || "").toLowerCase().includes(normalizedSearch) ||
        (item.category || "").toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, items, search]);

  const categoryCounts = useMemo(
    () => categories.map((category) => ({
      name: category,
      count: items.filter((item) => item.category === category).length,
    })),
    [categories, items]
  );

  const updateForm = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!cloudName || !uploadPreset) {
      setNotice("Configura VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET para subir archivos.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    const detectedMediaType = file.type.startsWith("video/") ? "video" : "image";
    const resourceType = detectedMediaType;
    setNotice(`Subiendo ${resourceType === "video" ? "video" : "imagen"} a la nube...`);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || "No se pudo subir la imagen.");
      }

      setNotice("");
      setFormData((prev) => ({
        ...prev,
        image: data.secure_url,
        mediaType: detectedMediaType,
      }));
    } catch (error) {
      setNotice(error.message || "Hubo un problema al subir la imagen.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const resetForm = () => {
    setFormData({ ...defaultForm, category: availableCategories[0] || DEFAULT_CATEGORIES[0] });
    setEditingId(null);
    setNotice("");
    setPendingDeleteId(null);
  };

  const openUploadSection = () => {
    resetForm();
    setActiveSection("upload");
  };

  const handleCreateCategory = (event) => {
    event.preventDefault();
    const name = newCategory.trim();

    if (!name) {
      setCategoryNotice("Escribe un nombre para la categoría.");
      return;
    }

    if (availableCategories.some((category) => category.toLowerCase() === name.toLowerCase())) {
      setCategoryNotice("Esa categoría ya existe.");
      return;
    }

    setCategories((prev) => [...prev, name]);
    setCategoryVisibility((prev) => ({ ...prev, [name]: true }));
    setFormData((prev) => ({ ...prev, category: name }));
    setNewCategory("");
    setCategoryNotice("");
  };

  const handleRenameCategory = (category) => {
    setCategoryToRename(category);
    setRenameValue(category);
    setRenameNotice("");
    setCategoryNotice("");
  };

  const closeRenameDialog = () => {
    setCategoryToRename(null);
    setRenameValue("");
    setRenameNotice("");
  };

  useEffect(() => {
    if (!categoryToRename) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeRenameDialog();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [categoryToRename]);

  const handleRenameSubmit = (event) => {
    event.preventDefault();
    const category = categoryToRename;
    const name = renameValue.trim();

    if (!category || !name) {
      setRenameNotice("Escribe un nombre para la categoría.");
      return;
    }

    if (name === category) {
      closeRenameDialog();
      return;
    }

    if (availableCategories.some((item) => item !== category && item.toLowerCase() === name.toLowerCase())) {
      setRenameNotice("Esa categoría ya existe.");
      return;
    }

    setCategories((prev) => prev.map((item) => (item === category ? name : item)));
    setCategoryVisibility((prev) => {
      const next = { ...prev, [name]: prev[category] !== false };
      delete next[category];
      return next;
    });
    setItems((prev) => prev.map((item) => (item.category === category ? { ...item, category: name } : item)));
    if (filter === category) setFilter(name);
    if (formData.category === category) setFormData((prev) => ({ ...prev, category: name }));
    setCategoryNotice("");
    closeRenameDialog();
  };

  const handleDeleteCategory = (category) => {
    const count = items.filter((item) => item.category === category).length;
    if (count) {
      setCategoryNotice(`No puedes eliminar “${category}” porque contiene ${count} ${count === 1 ? "foto" : "fotos"}.`);
      return;
    }

    if (categories.length <= 1) {
      setCategoryNotice("Debe existir al menos una categoría.");
      return;
    }

    setCategories((prev) => prev.filter((item) => item !== category));
    setCategoryVisibility((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
    if (filter === category) setFilter("Todos");
    if (formData.category === category) resetForm();
    setCategoryNotice("");
  };

  const toggleItemVisibility = (id) => {
    setItems((prev) => prev.map((item) => (
      item.id === id ? { ...item, visible: item.visible === false } : item
    )));
  };

  const toggleCarouselVisibility = (id) => {
    setItems((prev) => prev.map((item) => (
      item.id === id ? { ...item, carouselVisible: item.carouselVisible === false } : item
    )));
  };

  const toggleCategoryVisibility = (category) => {
    setCategoryVisibility((prev) => ({
      ...prev,
      [category]: prev[category] === false,
    }));
  };

  const handleAddUser = (event) => {
    event.preventDefault();
    const email = newUserEmail.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      setUserNotice("Escribe un correo válido.");
      return;
    }

    if (userEmails.some((item) => item.toLowerCase() === email)) {
      setUserNotice("Ese correo ya está registrado.");
      return;
    }

    setUserEmails((prev) => [...prev, email]);
    setNewUserEmail("");
    setUserNotice("");
  };

  const handleRemoveUser = (email) => {
    setUserEmails((prev) => prev.filter((item) => item !== email));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setNotice("Agrega un título antes de guardar.");
      return;
    }

    if (!formData.image.trim()) {
      setNotice("Agrega una imagen o sube un archivo antes de guardar.");
      return;
    }

    const nextItem = {
      id: editingId || `${formData.category}-${Date.now()}`,
      category: formData.category,
      title: formData.title.trim(),
      image: formData.image,
      mediaType: formData.mediaType,
      visible: editingId ? items.find((item) => item.id === editingId)?.visible !== false : true,
      carouselVisible: editingId
        ? items.find((item) => item.id === editingId)?.carouselVisible !== false
        : true,
    };

    if (editingId) {
      setItems((prev) => prev.map((item) => (item.id === editingId ? nextItem : item)));
    } else {
      setItems((prev) => [nextItem, ...prev]);
    }

    setNotice("");
    resetForm();
  };

  const handleEdit = (item) => {
    setActiveSection("editor");
    setEditingId(item.id);
    setPendingDeleteId(null);
    setFormData({
      category: item.category,
      title: item.title,
      image: item.image,
      mediaType: item.mediaType || "image",
      carouselVisible: item.carouselVisible !== false,
    });

    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      titleInputRef.current?.focus({ preventScroll: true });
    });
  };

  const handleDelete = (id) => {
    if (pendingDeleteId === id) {
      setItems((prev) => prev.filter((item) => item.id !== id));

      if (editingId === id) {
        resetForm();
      } else {
        setPendingDeleteId(null);
      }
      return;
    }

    setPendingDeleteId(id);
  };

  const moveItem = (id, direction) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index < 0) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const cloned = [...prev];
      const [item] = cloned.splice(index, 1);
      cloned.splice(targetIndex, 0, item);
      return cloned;
    });
  };

  return (
    <section className="admin-panel section">
      <div className={`admin-dashboard ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <span className="admin-brand-mark">BM</span>
            <div>
              <strong>Bajo mi lente</strong>
              <span>Studio admin</span>
            </div>
            <button
              type="button"
              className="admin-collapse-button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              aria-label={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
              title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              {isSidebarCollapsed ? "→" : "←"}
            </button>
          </div>

          <div className="admin-sidebar-heading">Workspace</div>
          <nav className="admin-nav" aria-label="Secciones de administración">
            {[
              ["overview", "Resumen"],
              ["upload", "Subir imágenes"],
              ["editor", "Editor"],
              ["library", "Biblioteca"],
              ["categories", "Categorías"],
              ["users", "Usuarios"],
            ].map(([section, label]) => (
              <button
                type="button"
                key={section}
                className={activeSection === section ? "active" : ""}
                onClick={() => {
                  if (section === "upload") {
                    openUploadSection();
                    return;
                  }

                  setActiveSection(section);
                }}
              >
                <span className={`admin-nav-icon admin-nav-icon-${section}`} aria-hidden="true" />
                <span className="admin-nav-label">{label}</span>
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <span className="admin-sidebar-status"><i /> Sistema activo</span>
            <button type="button" className="admin-exit" onClick={onClose}>
              Volver al sitio <span aria-hidden="true">↗</span>
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <div className="admin-header">
            <div>
              <div className="section-label">ADMIN / {activeSection.toUpperCase()}</div>
              <h2>{activeSection === "overview" ? "Panel de contenido" : activeSection === "upload" ? "Subir imágenes" : activeSection === "editor" ? "Editor" : activeSection === "library" ? "Biblioteca" : activeSection === "users" ? "Usuarios" : "Categorías"}</h2>
            </div>
            <span className="admin-main-date">Panel de administración</span>
          </div>

      {activeSection === "overview" && (
        <div className="admin-overview">
          <div className="admin-stats" aria-label="Resumen del portafolio">
            <div><strong>{items.length}</strong><span>Fotos</span></div>
            <div><strong>{categories.length}</strong><span>Categorías</span></div>
            <div><strong>{items.filter((item) => item.image).length}</strong><span>Con imagen</span></div>
          </div>
          <div className="admin-overview-copy">
            <div>
              <div className="section-label">CENTRO DE CONTENIDO</div>
              <h3>Gestiona tu portafolio por espacios.</h3>
                <p>Sube fotografías desde su apartado, edita las existentes desde el editor y organiza tu colección en la biblioteca.</p>
              </div>
              <button type="button" className="button button-light" onClick={openUploadSection}>
              Añadir fotografía
            </button>
          </div>
        </div>
      )}

      {activeSection === "editor" && !editingId && (
        <div className="admin-editor-empty">
          <div className="section-label">EDITOR</div>
          <h3>Selecciona una fotografía para editarla.</h3>
          <p>Abre la biblioteca y pulsa “Editar” en la imagen que quieras modificar.</p>
          <button type="button" className="button button-light" onClick={() => setActiveSection("library")}>
            Ir a la biblioteca
          </button>
        </div>
      )}

      {(activeSection === "upload" || (activeSection === "editor" && editingId)) && <div className="admin-shell admin-shell-editor">
        <form ref={formRef} className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-top">
            <div>
              <div className="section-label">{activeSection === "upload" ? "SUBIR IMAGEN" : "EDITAR ITEM"}</div>
              <h3>{activeSection === "upload" ? "Añade una nueva fotografía" : "Ajusta tu fotografía"}</h3>
            </div>
            <span className="admin-form-status">{activeSection === "upload" ? "Nuevo" : "Editando"}</span>
          </div>

          {notice && <p className="admin-notice">{notice}</p>}

          <div className="admin-form-layout">
            <div className="admin-form-fields">
              <div className="admin-grid">
                <label>
                  <span>Categoría</span>
                  <select name="category" value={formData.category} onChange={updateForm}>
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Título</span>
                  <input
                    ref={titleInputRef}
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={updateForm}
                    placeholder="Ej: Partido nocturno"
                    required
                  />
                </label>
              </div>

              <div className="admin-source-grid">
                        <label>
                          <span>Tipo de contenido</span>
                          <select name="mediaType" value={formData.mediaType} onChange={updateForm}>
                            <option value="image">Fotografía</option>
                            <option value="video">Video</option>
                          </select>
                        </label>
                <label>
                          <span>URL del {formData.mediaType === "video" ? "video" : "archivo"}</span>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={updateForm}
                    placeholder="https://..."
                  />
                </label>

                <label className="admin-upload">
                  <strong>Sube desde tu dispositivo</strong>
                  <small>{formData.mediaType === "video" ? "MOV, MP4 o WebM" : "JPG, PNG o WebP"} · Se optimiza en la nube</small>
                  <input
                    type="file"
                    accept="image/*,video/*,.mov,.mp4,.webm"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <span>{isUploading ? "Subiendo..." : "Elegir archivo"}</span>
                </label>
              </div>
            </div>

            <div className={`admin-media-column ${formData.image ? "has-image" : ""}`}>
              {formData.image ? (
                <div className="admin-preview">
                  {formData.mediaType === "video" ? (
                    <video src={formData.image} controls muted playsInline />
                  ) : (
                    <img src={formData.image} alt="Vista previa" />
                  )}
                  <span>Vista previa</span>
                </div>
              ) : (
                <div className="admin-preview-empty">
                  <span>Vista previa</span>
                  <strong>La imagen aparecerá aquí</strong>
                </div>
              )}
            </div>
          </div>

          <div className="admin-actions">
            <button type="submit" className="button button-light" disabled={isUploading}>
              {isUploading ? "Subiendo..." : activeSection === "upload" ? "Subir Archivo" : "Guardar cambios"}
            </button>
            {editingId && (
              <button type="button" className="button button-outline-dark" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>}

      {activeSection === "categories" && (
          <div className="admin-categories">
            <div className="admin-list-header">
              <div>
                <div className="section-label">ORGANIZACIÓN</div>
                <h3>Categorías</h3>
              </div>
            </div>
            <form className="admin-category-form" onSubmit={handleCreateCategory}>
              <input
                type="text"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Nueva categoría"
                aria-label="Nombre de la nueva categoría"
              />
              <button type="submit" className="button button-outline-dark">Añadir</button>
            </form>
            {categoryNotice && <p className="admin-category-notice">{categoryNotice}</p>}
            <div className="admin-category-list">
              {categoryCounts.map(({ name, count }) => (
                <div className="admin-category-row" key={name}>
                  <span><strong>{name}</strong><small>{count} {count === 1 ? "foto" : "fotos"}</small></span>
                  <div>
                    <button type="button" onClick={() => toggleCategoryVisibility(name)}>
                      {categoryVisibility[name] === false ? "Mostrar" : "Ocultar"}
                    </button>
                    <button type="button" onClick={() => handleRenameCategory(name)}>Renombrar</button>
                    <button type="button" className="danger" onClick={() => handleDeleteCategory(name)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
      )}

      {activeSection === "users" && (
        <div className="admin-users-page">
          <div className="admin-users-intro">
            <div>
              <div className="section-label">ACCESOS</div>
              <h3>Panel de usuarios</h3>
              <p>Registra los correos autorizados para el futuro acceso por email.</p>
            </div>
            <span className="admin-users-count">{userEmails.length} registrados</span>
          </div>
          <form className="admin-user-form" onSubmit={handleAddUser}>
            <input
              type="email"
              value={newUserEmail}
              onChange={(event) => setNewUserEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              aria-label="Correo del usuario"
            />
            <button type="submit" className="button button-light">Añadir usuario</button>
          </form>
          {userNotice && <p className="admin-category-notice">{userNotice}</p>}
          <div className="admin-user-list">
            {userEmails.length ? userEmails.map((email) => (
              <div className="admin-user-row" key={email}>
                <span className="admin-user-avatar">{email.charAt(0).toUpperCase()}</span>
                <strong>{email}</strong>
                <span className="admin-user-role">Editor</span>
                <button type="button" className="danger" onClick={() => handleRemoveUser(email)}>Eliminar</button>
              </div>
            )) : <p className="admin-empty">Todavía no hay correos registrados.</p>}
          </div>
        </div>
      )}

      {activeSection === "library" && (
        <div className="admin-list">
          <div className="admin-list-header">
            <div>
              <div className="section-label">BIBLIOTECA</div>
              <h3>Imágenes del portafolio</h3>
            </div>

            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="Todos">Todos</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <input
            className="admin-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título o categoría..."
            aria-label="Buscar fotografías"
          />

          {visibleItems.length === 0 ? (
            <p className="admin-empty">
              {items.length ? "No hay resultados para esta búsqueda." : "No hay imágenes cargadas todavía."}
            </p>
          ) : (
            <div className="admin-items">
              {visibleItems.map((item) => (
                <div key={item.id} className={`admin-item ${item.visible === false ? "is-hidden" : ""}`}>
                  <img src={item.image} alt={item.title} />

                  <div className="admin-item-copy">
                    <span>{item.category}</span>
                    <strong>{item.title}</strong>
                  </div>

                  <div className="admin-item-actions">
                    <button type="button" onClick={() => toggleCarouselVisibility(item.id)}>
                      {item.carouselVisible === false ? "Añadir al carrusel" : "Quitar del carrusel"}
                    </button>
                    <button type="button" onClick={() => toggleItemVisibility(item.id)}>
                      {item.visible === false ? "Mostrar" : "Ocultar"}
                    </button>
                    <button type="button" onClick={() => handleEdit(item)}>
                      Editar
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(item.id)}>
                      {pendingDeleteId === item.id ? "Confirmar" : "Eliminar"}
                    </button>
                    <div className="admin-item-order">
                      <button type="button" onClick={() => moveItem(item.id, "up")} aria-label="Subir">
                        ↑
                      </button>
                      <button type="button" onClick={() => moveItem(item.id, "down")} aria-label="Bajar">
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        </div>
      </div>

      {categoryToRename && (
        <div className="admin-dialog-backdrop" role="presentation" onMouseDown={closeRenameDialog}>
          <div
            className="admin-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-category-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="admin-dialog-close"
              onClick={closeRenameDialog}
              aria-label="Cerrar diálogo"
            >
              ×
            </button>
            <div className="section-label">CATEGORÍA</div>
            <h3 id="rename-category-title">Renombrar categoría</h3>
            <p>El nuevo nombre se aplicará también a las fotografías de esta colección.</p>
            <form onSubmit={handleRenameSubmit}>
              <label>
                <span>Nuevo nombre</span>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  autoFocus
                  maxLength={50}
                />
              </label>
              {renameNotice && <p className="admin-dialog-notice">{renameNotice}</p>}
              <div className="admin-dialog-actions">
                <button type="button" className="button button-outline-dark" onClick={closeRenameDialog}>
                  Cancelar
                </button>
                <button type="submit" className="button button-light">
                  Guardar nombre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminPanel;
