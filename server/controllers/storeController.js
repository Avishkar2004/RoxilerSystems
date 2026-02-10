import pool from "../config/db.js";

export async function listStoresForUser(req, res) {
  try {
    const userId = req.user.id;
    const { search } = req.query;
    const params = [userId];
    let searchClause = "";

    if (search) {
      searchClause = "WHERE s.name LIKE ? OR s.address LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    const query = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(AVG(r.rating), 0) AS averageRating,
        MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS userRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      ${searchClause}
      GROUP BY s.id, s.name, s.email, s.address
      ORDER BY s.name ASC;
    `;

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error("List stores for user error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getStoreRatingsForOwner(req, res) {
  try {
    const ownerId = req.user.id;

    const [[store]] = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.address,
        COALESCE(AVG(r.rating), 0) AS averageRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = ?
      GROUP BY s.id, s.name, s.address
    `,
      [ownerId]
    );

    if (!store) {
      return res
        .status(404)
        .json({ message: "No store associated with this owner." });
    }

    const [ratings] = await pool.query(
      `
      SELECT
        r.id,
        r.rating,
        r.created_at,
        u.id AS userId,
        u.name AS userName,
        u.email AS userEmail
      FROM ratings r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC;
    `,
      [store.id]
    );

    return res.json({
      store,
      ratings,
    });
  } catch (err) {
    console.error("Get store ratings for owner error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

