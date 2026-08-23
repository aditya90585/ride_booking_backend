import express from "express";
import { captainLoginValidation, captainSignUpValidation } from "../validation/captainvalidation.js";
import { getCaptainProfile, loginCaptain, logoutCaptain, registerCaptain } from "../controllers/captain.controller.js";
import { captainAuthMiddleware } from "../middleware/auth.midleware.js";


const router = express.Router();

router.post("/register",captainSignUpValidation, registerCaptain);
router.post("/login", captainLoginValidation, loginCaptain);
router.get("/profile", captainAuthMiddleware, getCaptainProfile);
router.get("/logout", captainAuthMiddleware, logoutCaptain);

export default router;