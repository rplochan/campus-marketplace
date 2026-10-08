import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const { rows } = await query(
    `SELECT l.*, u.name AS seller_name FROM favorites f
     JOIN listings l ON l.id = f.listing_id JOIN users u ON u.id = l.seller_id
     WHERE f.user_id=$1 ORDER BY l.created_at DESC`, [req.userId]);
  res.json({ listings: rows });
});

router.get("/ids", async (req, res) => {
  const { rows } = await query("SELECT listing_id FROM favorites WHERE user_id=$1", [req.userId]);
  res.json({ ids: rows.map((r) => r.listing_id) });
});

router.put("/:listingId", async (req, res) => {
  const exists = await query("SELECT 1 FROM listings WHERE id=$1", [req.params.listingId]);
  if (!exists.rowCount) return res.status(404).json({ error: "Listing not found" });
  await query("INSERT INTO favorites (user_id,listing_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [req.userId, req.params.listingId]);
  res.json({ ok: true });
});

router.delete("/:listingId", async (req, res) => {
  await query("DELETE FROM favorites WHERE user_id=$1 AND listing_id=$2", [req.userId, req.params.listingId]);
  res.json({ ok: true });
});

export default router;