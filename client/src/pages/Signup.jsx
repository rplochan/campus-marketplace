import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    return e;
  }

  async function submit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try { await register(form); navigate("/"); }
    catch (err) { setErrors({ form: err.message }); }
    finally { setBusy(false); }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form className="card form narrow" onSubmit={submit} noValidate>
      <h1>Create account</h1>
      {errors.form && <p className="error" role="alert">{errors.form}</p>}
      <label>Name<input value={form.name} onChange={set("name")} />{errors.name && <span className="error">{errors.name}</span>}</label>
      <label>Email<input type="email" value={form.email} onChange={set("email")} />{errors.email && <span className="error">{errors.email}</span>}</label>
      <label>Password<input type="password" value={form.password} onChange={set("password")} />{errors.password && <span className="error">{errors.password}</span>}</label>
      <button className="btn" disabled={busy}>{busy ? "Creating…" : "Sign up"}</button>
      <p className="muted">Have an account? <Link to="/login">Log in</Link></p>
    </form>
  );
}