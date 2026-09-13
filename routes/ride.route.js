import express from "express";
import { createRideValidation } from "../validation/rideValidation.js";
import { calculateFare, confirmRideController, createRideController, endRideController, startRideController } from "../controllers/ride.controller.js";
import { authMiddleware, captainAuthMiddleware } from "../middleware/auth.midleware.js";

const router = express.Router();

router.post("/create", createRideValidation, authMiddleware, createRideController);
router.get("/get-fare", authMiddleware,calculateFare)
router.post("/confirm-ride", captainAuthMiddleware, confirmRideController)
router.post("/start-ride", captainAuthMiddleware, startRideController)
router.post("/end-ride", captainAuthMiddleware, endRideController)

export default router