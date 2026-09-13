import express from "express";
import { confirmCashPayment, createOrder, getPaymentStatus, handleWebhook, verifyPayment } from "../controllers/payment.controller.js";
import { authMiddleware, captainAuthMiddleware } from "../middleware/auth.midleware.js";

const router = express.Router();

router.post(
    "/create-order",
    authMiddleware,
    createOrder
);

router.post(
    "/verify",
    authMiddleware,
    verifyPayment
);

router.post(
    "/webhook",
    handleWebhook
);

router.get(
    "/status/:rideId",
    authMiddleware,
    getPaymentStatus
);

router.post(
    "/confirm-cash",
    captainAuthMiddleware,
    confirmCashPayment
);

export default router;