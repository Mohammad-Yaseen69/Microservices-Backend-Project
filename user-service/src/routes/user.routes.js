import { 
  deleteUser, 
  getAllUsers, 
  getUserProfile, 
  login, 
  logout, 
  refreshAccessToken, 
  registerUser 
} from "../controllers/user.controller.js";
import { authenticationMiddleware } from "../middlewares/user.middleware.js";
import { Router } from "express";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", login);
router.get("/refresh", refreshAccessToken);

// Protected routes
router.use(authenticationMiddleware);
router.get("/profile/:userId", getUserProfile);
router.get("/all", getAllUsers);
router.delete("/delete/:userId", deleteUser);
router.post("/logout", logout);

export default router;
