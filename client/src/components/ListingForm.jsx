import { useState } from "react";
import { CATEGORIES } from "../api";

const MAX_MB = 5;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Image upload failed");
  return (await res.json()).secure_url;
}

export default function ListingForm({ initial, onSubmit, submitLabel }) {
  const [form, setForm] = useState({
    title: "", description: "", price: "", category: "", image_url: "",
    location_name: null, lat: null, lng: null, ...initial,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function pickFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!TYPES.includes(file.type)) return setErrors({ ...errors, image_url: "Use a JPG, PNG or WebP image" });
    if (file.size > MAX_MB * 1024 * 1024) return setErrors({ ...errors, image_url: `Image must be under ${MAX_MB} MB` });
    setUploading(true); setErrors({ ...errors, image_url: undefined });
    try { setForm((f) => ({ ...f, image_url: "" })); const url = await uploadToCloudinary(file); setForm((f) => ({ ...f, image_url: url })); }
    catch (err) { setErrors((er) => ({ ...er, image_url: err.message })); }
    finally { setUploading(false); }
  }

  function validate() {
    const e = {};
    if (form.title.trim().length < 3) e.title = "Title must be at least 3 characters";
    if (form.description.trim().length < 10) e.description = "Description must be at least 10 characters";
    if (!(Number(form.price) > 0)) e.price = "Enter a price greater than 0";
    if (!form.category) e.category = "Select a category";
    if (!form.image_url) e.image_url = "Please upload an image";
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try { await onSubmit({ ...form, price: Number(form.price) }); }
    catch (err) { setErrors({ form: err.message }); setBusy(false); }
  }

  return (
    <form className="card form narrow" style={{ maxWidth: 600 }} onSubmit={submit} noValidate>
      {errors.form && <p className="error" role="alert">{errors.form}</p>}
      <label>Item name<input value={form.title} onChange={set("title")} maxLength={100} />{errors.title && <span className="error">{errors.title}</span>}</label>
      <label>Description<textarea rows={4} value={form.description} onChange={set("description")} maxLength={1000} />{errors.description && <span className="error">{errors.description}</span>}</label>
      <label>Price (₹)<input type="number" min="1" value={form.price} onChange={set("price")} />{errors.price && <span className="error">{errors.price}</span>}</label>
      <label>Category
        <select value={form.category} onChange={set("category")}>
          <option value="">Select…</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        {errors.category && <span className="error">{errors.category}</span>}
      </label>
      <label>Image<input type="file" accept={TYPES.join(",")} onChange={pickFile} />
        {uploading && <span className="muted">Uploading…</span>}
        {form.image_url && <img className="preview" src={form.image_url} alt="Preview" />}
        {errors.image_url && <span className="error">{errors.image_url}</span>}
      </label>
      {/* LOCATION_HERE */}
      <button className="btn" disabled={busy || uploading}>{busy ? "Saving…" : submitLabel}</button>
    </form>
  );
}