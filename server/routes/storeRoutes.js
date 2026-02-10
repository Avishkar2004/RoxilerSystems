import express from "express";
import { authenticate, authorize, ROLES } from "../middleware/auth.js";
import {
  listStoresForUser,
  getStoreRatingsForOwner,
} from "../controllers/storeController.js";

const router = express.Router();

// Normal user: list all stores with search and user's rating
router.get("/", authenticate, authorize(ROLES.USER), listStoresForUser);

// Store owner: dashboard with users who rated their store and average rating
router.get(
  "/owner/ratings",
  authenticate,
  authorize(ROLES.STORE_OWNER),
  getStoreRatingsForOwner
);

export default router;

