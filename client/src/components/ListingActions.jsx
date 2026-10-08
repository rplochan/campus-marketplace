import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function ListingActions({ listing, onChange, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(fn) {
    setBusy(true); setError("");
    try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const toggleSold = () => run(async () => {
    const { listing: l } = await api(`/listings/${listing.id}/sold`, { method: "PATCH", body: { sold: !listing.is_sold } });
    onChange?.({ ...listing, ...l });
  });
  const remove = () => {
    if (!window.confirm("Delete this listing permanently?")) return;
    run(async () => { await api(`/listings/${listing.id}`, { method: "DELETE" }); onDeleted?.(listing.id); });
  };

  return (
    <div>
      <div className="row">
        <Link to={`/listings/${listing.id}/edit`} className="btn-ghost">Edit</Link>
        <button className="btn-ghost" onClick={toggleSold} disabled={busy}>{listing.is_sold ? "Mark available" : "Mark as sold"}</button>
        <button className="btn-danger" onClick={remove} disabled={busy}>Delete</button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}