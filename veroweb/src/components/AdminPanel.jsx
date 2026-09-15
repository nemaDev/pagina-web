import { useMemo, useState } from "react";
import { DEFAULT_CATEGORIES } from "../data/categories";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const defaultForm = {
  category: DEFAULT_CATEGORIES[0],
  title: "",
  image: "",
};

function AdminPanel({
  items = [],
  setItems = () => {},
  categories = DEFAULT_CATEGORIES,
  setCategories = () => {},
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
    setNotice("Subiendo imagen a la nube...");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || "No se pudo subir la imagen.");
      }

      setNotice("");
      setFormData((prev) => ({ ...prev, image: data.secure_url }));
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
    setFormData((prev) => ({ ...prev, category: name }));
    setNewCategory("");
    setCategoryNotice("");
  };

  const handleRenameCategory = (category) => {
    const name = window.prompt("Nuevo nombre de la categoría", category)?.trim();
    if (!name || name === category) return;

    if (availableCategories.some((item) => item !== category && item.toLowerCase() === name.toLowerCase())) {
      setCategoryNotice("Esa categoría ya existe.");
      return;
    }

    setCategories((prev) => prev.map((item) => (item === category ? name : item)));
    setItems((prev) => prev.map((item) => (item.category === category ? { ...item, category: name } : item)));
    if (filter === category) setFilter(name);
    if (formData.category === category) setFormData((prev) => ({ ...prev, category: name }));
    setCategoryNotice("");
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
    if (filter === category) setFilter("Todos");
    if (formData.category === category) resetForm();
    setCategoryNotice("");
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
    setEditingId(item.id);
    setPendingDeleteId(null);
    setFormData({
      category: item.category,
      title: item.title,
      image: item.image,
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
      <div className="admin-header">
        <div>
          <div className="section-label">ADMIN</div>
          <h2>Panel de contenido</h2>
        </div>

        <button type="button" className="button button-light" onClick={onClose}>
          Volver al sitio
        </button>
      </div>

      <div className="admin-shell">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-top">
            <div className="section-label">{editingId ? "EDITAR ITEM" : "NUEVO ITEM"}</div>
          </div>

          {notice && <p className="admin-notice">{notice}</p>}

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
                type="text"
                name="title"
                value={formData.title}
                onChange={updateForm}
                placeholder="Ej: Partido nocturno"
                required
              />
            </label>
          </div>

          <label>
            <span>URL de la imagen</span>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={updateForm}
              placeholder="https://..."
            />
          </label>

          <label className="admin-upload">
            <span>O subir archivo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>

          {formData.image && (
            <div className="admin-preview">
              <img src={formData.image} alt="Preview" />
            </div>
          )}

          <div className="admin-actions">
            <button type="submit" className="button button-light" disabled={isUploading}>
              {isUploading ? "Subiendo..." : editingId ? "Guardar cambios" : "Agregar imagen"}
            </button>
            {editingId && (
              <button type="button" className="button button-outline-dark" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="admin-list">
          <div className="admin-stats" aria-label="Resumen del portafolio">
            <div><strong>{items.length}</strong><span>Fotos</span></div>
            <div><strong>{categories.length}</strong><span>Categorías</span></div>
            <div><strong>{items.filter((item) => item.image).length}</strong><span>Con imagen</span></div>
          </div>

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
                    <button type="button" onClick={() => handleRenameCategory(name)}>Renombrar</button>
                    <button type="button" className="danger" onClick={() => handleDeleteCategory(name)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                <div key={item.id} className="admin-item">
                  <img src={item.image} alt={item.title} />

                  <div className="admin-item-copy">
                    <span>{item.category}</span>
                    <strong>{item.title}</strong>
                  </div>

                  <div className="admin-item-actions">
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
      </div>
    </section>
  );
}

export default AdminPanel;
