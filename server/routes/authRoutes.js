import express from "express";
import { signup, login, changePassword } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Normal user signup
router.post("/signup", signup);

// Login for all roles
router.post("/login", login);

// Change password (after login)
router.post("/change-password", authenticate, changePassword);

export default router;

