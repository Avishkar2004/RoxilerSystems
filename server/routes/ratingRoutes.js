import express from "express";
import { authenticate, authorize, ROLES } from "../middleware/auth.js";
import { upsertRating } from "../controllers/ratingController.js";

const router = express.Router();

// Normal user submit or update rating for a store
router.post("/", authenticate, authorize(ROLES.USER), upsertRating);

export default router;

