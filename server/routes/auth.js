import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { validateRegister } from "../validate.js";
import { signToken, setAuthCookie, requireAuth } from "../middleware/auth.js";

const router = Router();
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

router.post("/register", async (req, res) => {
  const errors = validateRegister(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: Object.values(errors)[0], errors });

  const email = req.body.email.trim().toLowerCase();
  const exists = await query("SELECT 1 FROM users WHERE email=$1", [email]);
  if (exists.rowCount) return res.status(409).json({ error: "Email already registered" });

  const hash = await bcrypt.hash(req.body.password, 10);
  const { rows } = await query(
    "INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING *",
    [req.body.name.trim(), email, hash]
  );
  setAuthCookie(res, signToken(rows[0]));
  res.status(201).json({ user: publicUser(rows[0]) });
});

router.post("/login", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const { rows } = await query("SELECT * FROM users WHERE email=$1", [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password_hash)))
    return res.status(401).json({ error: "Invalid email or password" });
  setAuthCookie(res, signToken(user));
  res.json({ user: publicUser(user) });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await query("SELECT * FROM users WHERE id=$1", [req.userId]);
  if (!rows[0]) return res.status(401).json({ error: "User not found" });
  res.json({ user: publicUser(rows[0]) });
});

export default router;