import pool from "../config/db.js";

export async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const [[user]] = await pool.query(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(user);
  } catch (err) {
    console.error("Get current user error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

