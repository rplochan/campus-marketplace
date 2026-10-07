import jwt from "jsonwebtoken";

export const signToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const setAuthCookie = (res, token) =>
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

export function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Please log in" });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please log in again" });
  }
}