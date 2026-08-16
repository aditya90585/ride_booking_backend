import express from "express";
import { loginValidation, signUpValidation } from "../validation/authValidation.js";
import { getUserProfile, login, logout, register } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.midleware.js";


const router = express.Router();

router.post("/register",signUpValidation, register);
router.post("/login", loginValidation, login);
router.get("/profile", authMiddleware, getUserProfile);
router.get("/logout", authMiddleware, logout);

export default router;