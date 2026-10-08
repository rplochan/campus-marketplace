import { Router } from "express";

const router = Router();
const cache = new Map();

router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (q.length < 3) return res.json({ results: [] });
  if (cache.has(q)) return res.json({ results: cache.get(q) });

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { "User-Agent": "CampusMarketplace/1.0 (student project)" } });
  if (r.status === 429) return res.status(429).json({ error: "Too many searches, wait a moment" });
  if (!r.ok) return res.status(502).json({ error: "Location service unavailable" });

  const results = (await r.json()).map((p) => ({ name: p.display_name, lat: Number(p.lat), lng: Number(p.lon) }));
  if (cache.size > 200) cache.clear();
  cache.set(q, results);
  res.json({ results });
});

export default router;