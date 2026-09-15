import { useMemo, useState } from "react";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const defaultForm = {
  category: "Deportes",
  title: "",
  image: "",
};

const categories = ["Deportes", "Retratos", "Eventos", "Automotriz"];

function AdminPanel({ items = [], setItems = () => {}, onClose = () => {} }) {
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const [notice, setNotice] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const availableCategories = useMemo(
    () => [...new Set([...categories, ...items.map((item) => item.category).filter(Boolean)])],
    [items]
  );

  const visibleItems =
    filter === "Todos" ? items : items.filter((item) => item.category === filter);

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
    setFormData(defaultForm);
    setEditingId(null);
    setNotice("");
    setPendingDeleteId(null);
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
          <div className="admin-list-header">
            <h3>Imágenes del portafolio</h3>

            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="Todos">Todos</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {visibleItems.length === 0 ? (
            <p className="admin-empty">No hay imágenes cargadas todavía.</p>
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
