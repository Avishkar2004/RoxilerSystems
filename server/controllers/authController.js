import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { ROLES } from "../constants/roles.js";
import {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} from "../utils/validation.js";

function signToken(user) {
  const payload = { id: user.id, role: user.role };
  const secret = process.env.JWT_SECRET || "Avishkar@123";
  const expiresIn = "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

export async function signup(req, res) {
  try {
    const { name, email, address, password } = req.body;

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

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email.toLowerCase(), address || "", passwordHash, ROLES.USER]
    );

    const user = {
      id: result.insertId,
      name,
      email: email.toLowerCase(),
      role: ROLES.USER,
    };

    const token = signToken(user);

    return res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    console.error("Signup error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email.toLowerCase(),
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];

    // Handle case where legacy rows might not have password_hash set
    if (!user.password_hash) {
      console.error(
        "Login error: user record missing password_hash",
        { id: user.id, email: user.email }
      );
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be 8-16 chars, include one uppercase and one special character.",
      });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = rows[0];

    if (!user.password_hash) {
      console.error(
        "Change password error: user record missing password_hash",
        { id: user.id, email: user.email }
      );
      return res
        .status(400)
        .json({ message: "User password is not set. Please contact an administrator." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHash,
      userId,
    ]);

    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

