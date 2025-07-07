import express from "express";
import {
  getUsers,
  Register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/Users.js";
import { verifyToken } from "../middelware/verifyToken.js";
import { refreshToken } from "../controllers/refreshToken.js";
import { googleLogin } from "../controllers/Users.js";

const router = express.Router();

router.get(`/users`, verifyToken, getUsers);
router.post(`/users`, Register);
router.post(`/login`, login);
router.get(`/token`, refreshToken);
router.delete(`/logout`, logout);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
