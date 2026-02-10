import pool from "../config/db.js";
import { ROLES } from "../constants/roles.js";
import {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} from "../utils/validation.js";
import bcrypt from "bcryptjs";

export async function getDashboardStats(req, res) {
  try {
    const [[{ totalUsers }]] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );
    const [[{ totalStores }]] = await pool.query(
      "SELECT COUNT(*) AS totalStores FROM stores"
    );
    const [[{ totalRatings }]] = await pool.query(
      "SELECT COUNT(*) AS totalRatings FROM ratings"
    );

    return res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error("Dashboard stats error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, address, password, role } = req.body;

    if (!validateName(name)) {
      return res
        .status(400)
        .json({ message: "Name must be between 20 and 60 characters." });
    }
    if (!validateAddress(address)) {
      return res
        .status(400)
        .json({ message: "Address must be at most 400 characters." });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email." });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 chars, include one uppercase and one special character.",
      });
    }

    const roleValue = role && ROLES[role.toUpperCase()] ? ROLES[role.toUpperCase()] : ROLES.USER;

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email.toLowerCase(), address || "", passwordHash, roleValue]
    );

    return res.status(201).json({
      id: result.insertId,
      name,
      email: email.toLowerCase(),
      address,
      role: roleValue,
    });
  } catch (err) {
    console.error("Admin create user error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!validateName(name)) {
      return res
        .status(400)
        .json({ message: "Name must be between 20 and 60 characters." });
    }
    if (!validateAddress(address)) {
      return res
        .status(400)
        .json({ message: "Address must be at most 400 characters." });
    }
    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email." });
    }

    let ownerIdValue = ownerId || null;
    if (ownerIdValue) {
      const [owners] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND role = ?",
        [ownerIdValue, ROLES.STORE_OWNER]
      );
      if (owners.length === 0) {
        return res
          .status(400)
          .json({ message: "Owner must be a valid store owner user." });
      }
    }

    const [result] = await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
      [name.trim(), email || null, address || "", ownerIdValue]
    );

    return res.status(201).json({
      id: result.insertId,
      name,
      email,
      address,
      ownerId: ownerIdValue,
    });
  } catch (err) {
    console.error("Admin create store error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listStores(req, res) {
  try {
    const { name, email, address } = req.query;
    let where = "WHERE 1=1";
    const params = [];

    if (name) {
      where += " AND s.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (email) {
      where += " AND s.email LIKE ?";
      params.push(`%${email}%`);
    }
    if (address) {
      where += " AND s.address LIKE ?";
      params.push(`%${address}%`);
    }

    const query = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(AVG(r.rating), 0) AS averageRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      ${where}
      GROUP BY s.id, s.name, s.email, s.address
      ORDER BY s.name ASC;
    `;

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error("Admin list stores error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listUsers(req, res) {
  try {
    const { name, email, address, role } = req.query;
    let where = "WHERE 1=1";
    const params = [];

    if (name) {
      where += " AND u.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (email) {
      where += " AND u.email LIKE ?";
      params.push(`%${email}%`);
    }
    if (address) {
      where += " AND u.address LIKE ?";
      params.push(`%${address}%`);
    }
    if (role) {
      where += " AND u.role = ?";
      params.push(role.toUpperCase());
    }

    const query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.address,
        u.role
      FROM users u
      ${where}
      ORDER BY u.name ASC;
    `;

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error("Admin list users error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserDetails(req, res) {
  try {
    const { id } = req.params;
    const [[user]] = await pool.query(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [id]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let storeRatingInfo = null;
    if (user.role === ROLES.STORE_OWNER) {
      const [[store]] = await pool.query(
        `
        SELECT
          s.id,
          s.name,
          COALESCE(AVG(r.rating), 0) AS averageRating
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
        WHERE s.owner_id = ?
        GROUP BY s.id, s.name
      `,
        [id]
      );
      storeRatingInfo = store || null;
    }

    return res.json({ user, storeRatingInfo });
  } catch (err) {
    console.error("Admin get user details error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

