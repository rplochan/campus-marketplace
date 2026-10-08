import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validateListing } from "../validate.js";

const router = Router();
const BASE = `SELECT l.*, u.name AS seller_name, u.email AS seller_email
              FROM listings l JOIN users u ON u.id = l.seller_id`;

// Browse with search, filters, pagination
router.get("/", async (req, res) => {
  const { q, category, minPrice, maxPrice, showSold, sort } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 12;
  const where = [];
  const params = [];

  if (q) { params.push(`%${q}%`); where.push(`(l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`); }
  if (category) { params.push(category); where.push(`l.category = $${params.length}`); }
  if (minPrice && !isNaN(minPrice)) { params.push(Number(minPrice)); where.push(`l.price >= $${params.length}`); }
  if (maxPrice && !isNaN(maxPrice)) { params.push(Number(maxPrice)); where.push(`l.price <= $${params.length}`); }
  if (showSold !== "true") where.push("l.is_sold = false");

  const clause = where.length ? "WHERE " + where.join(" AND ") : "";
  const order = { price_asc: "l.price ASC", price_desc: "l.price DESC" }[sort] || "l.created_at DESC";

  const total = await query(`SELECT COUNT(*) FROM listings l ${clause}`, params);
  const { rows } = await query(
    `${BASE} ${clause} ORDER BY l.is_sold ASC, ${order} LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    params
  );
  const count = Number(total.rows[0].count);
  res.json({ listings: rows, page, totalPages: Math.max(1, Math.ceil(count / limit)), total: count });
});

// Must be declared before "/:id"
router.get("/mine", requireAuth, async (req, res) => {
  const { rows } = await query(`${BASE} WHERE l.seller_id=$1 ORDER BY l.created_at DESC`, [req.userId]);
  res.json({ listings: rows });
});

router.get("/:id", async (req, res) => {
  const { rows } = await query(`${BASE} WHERE l.id=$1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Listing not found" });
  res.json({ listing: rows[0] });
});

router.post("/", requireAuth, async (req, res) => {
  const errors = validateListing(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: Object.values(errors)[0], errors });
  const b = req.body;
  const { rows } = await query(
    `INSERT INTO listings (seller_id,title,description,price,category,image_url,location_name,lat,lng)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [req.userId, b.title.trim(), b.description.trim(), b.price, b.category, b.image_url,
     b.location_name || null, b.lat ?? null, b.lng ?? null]
  );
  res.status(201).json({ listing: rows[0] });
});

// Ownership guard: 404 if missing, 403 if not the seller
async function ownListing(req, res, next) {
  const { rows } = await query("SELECT seller_id FROM listings WHERE id=$1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Listing not found" });
  if (rows[0].seller_id !== req.userId) return res.status(403).json({ error: "You can only modify your own listings" });
  next();
}

router.put("/:id", requireAuth, ownListing, async (req, res) => {
  const errors = validateListing(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: Object.values(errors)[0], errors });
  const b = req.body;
  const { rows } = await query(
    `UPDATE listings SET title=$1, description=$2, price=$3, category=$4, image_url=$5,
       location_name=$6, lat=$7, lng=$8, updated_at=now()
     WHERE id=$9 RETURNING *`,
    [b.title.trim(), b.description.trim(), b.price, b.category, b.image_url,
     b.location_name || null, b.lat ?? null, b.lng ?? null, req.params.id]
  );
  res.json({ listing: rows[0] });
});

router.patch("/:id/sold", requireAuth, ownListing, async (req, res) => {
  const sold = req.body.sold !== false;
  const { rows } = await query(
    "UPDATE listings SET is_sold=$1, updated_at=now() WHERE id=$2 RETURNING *",
    [sold, req.params.id]
  );
  res.json({ listing: rows[0] });
});

router.delete("/:id", requireAuth, ownListing, async (req, res) => {
  await query("DELETE FROM listings WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

export default router;