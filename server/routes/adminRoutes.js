import express from "express";
import { authenticate, authorize, ROLES } from "../middleware/auth.js";
import {
  getDashboardStats,
  createUser,
  createStore,
  listStores,
  listUsers,
  getUserDetails,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get("/dashboard", getDashboardStats);
router.post("/users", createUser);
router.post("/stores", createStore);
router.get("/stores", listStores);
router.get("/users", listUsers);
router.get("/users/:id", getUserDetails);

export default router;

