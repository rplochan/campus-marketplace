import { useEffect, useState } from "react";
import { api } from "../api";

export default function LocationPicker({ value, onChange }) {
  const [text, setText] = useState(value || "");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || text.trim().length < 3) return setResults([]);
    const t = setTimeout(() => {
      api(`/geocode?q=${encodeURIComponent(text)}`)
        .then((d) => { setResults(d.results); setError(""); })
        .catch((e) => setError(e.message));
    }, 500);
    return () => clearTimeout(t);
  }, [text, open]);

  return (
    <label>Pickup location (optional)
      <input value={text} placeholder="e.g. IISc Bangalore main gate"
        onChange={(e) => { setText(e.target.value); setOpen(true); if (!e.target.value) onChange({ location_name: null, lat: null, lng: null }); }} />
      {error && <span className="error">{error}</span>}
      {open && results.length > 0 && (
        <ul className="suggestions">
          {results.map((r) => (
            <li key={r.name} onClick={() => { setText(r.name); setOpen(false); onChange({ location_name: r.name, lat: r.lat, lng: r.lng }); }}>
              {r.name}
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}