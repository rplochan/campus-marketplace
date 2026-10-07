import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.email || !form.password) return setError("Email and password are required");
    setBusy(true); setError("");
    try { await login(form.email, form.password); navigate(from, { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <form className="card form narrow" onSubmit={submit}>
      <h1>Log in</h1>
      {error && <p className="error" role="alert">{error}</p>}
      <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="btn" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      <p className="muted">No account? <Link to="/signup">Sign up</Link></p>
    </form>
  );
}