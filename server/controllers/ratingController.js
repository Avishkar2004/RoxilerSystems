import pool from "../config/db.js";

export async function upsertRating(req, res) {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId || !rating) {
      return res
        .status(400)
        .json({ message: "Store ID and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Ensure store exists
    const [[store]] = await pool.query("SELECT id FROM stores WHERE id = ?", [
      storeId,
    ]);
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    const query = `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP
    `;

    await pool.query(query, [userId, storeId, rating]);

    return res.json({ message: "Rating submitted successfully." });
  } catch (err) {
    console.error("Upsert rating error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

