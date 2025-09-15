import jwt from "jsonwebtoken";
const JWT_SECRET = (process.env.JWT_SECRET || "dev_secret").trim();

export default function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, role, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
