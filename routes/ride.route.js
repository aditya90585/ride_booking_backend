import express from "express";
import { createRideValidation } from "../validation/rideValidation.js";
import { calculateFare, createRideController } from "../controllers/ride.controller.js";
import { authMiddleware } from "../middleware/auth.midleware.js";

const router = express.Router();

router.post("/create", createRideValidation,authMiddleware, createRideController);
router.get("/get-fare",authMiddleware,calculateFare)
export default router