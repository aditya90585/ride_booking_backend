import { validationResult } from "express-validator";
import Razorpay from "../config/razorpay.js";
import Ride from "../models/ride.model.js";
import Payment from "../models/payment.model.js";
import crypto from "crypto";
import { sendMessageToSocketId } from "../socket/socket.js";
import mongoose from "mongoose";


const createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({
                success: false,
                message: "rideId is required"
            });
        }

        // -----------------------------------------
        // 1. Find the ride belonging to this user
        // -----------------------------------------

        const ride = await Ride.findOne({
            _id: rideId,
            user: req.user.id
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found"
            });
        }

        // -----------------------------------------
        // 2. Ride must be completed
        // -----------------------------------------

        if (ride.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Ride is not completed yet"
            });
        }

        // -----------------------------------------
        // 3. Ride must use online payment
        // -----------------------------------------

        if (ride.paymentMethod !== "online") {
            return res.status(400).json({
                success: false,
                message: "This ride does not use online payment"
            });
        }

        // -----------------------------------------
        // 4. Don't create another order if paid
        // -----------------------------------------

        if (ride.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Ride is already paid"
            });
        }

        // -----------------------------------------
        // 5. Look for an existing payment attempt
        // -----------------------------------------

        const existingPayment = await Payment.findOne({
            ride: ride._id,
            user: req.user.id,
            active: true,
            status: {
                $in: ["created", "pending", "authorized"]
            }
        }).sort({
            createdAt: -1
        });

        // -----------------------------------------
        // 6. Reuse existing Razorpay order
        // -----------------------------------------

        if (existingPayment) {

            console.log(
                "Reusing existing payment order:",
                existingPayment.razorpayOrderId
            );

            return res.status(200).json({
                success: true,
                message: "Existing payment order returned",

                payment: {
                    paymentId: existingPayment._id,
                    orderId: existingPayment.razorpayOrderId,
                    amount: Math.round(
                        existingPayment.amount * 100
                    ),
                    currency: existingPayment.currency
                }
            });
        }

        // -----------------------------------------
        // 7. Amount comes ONLY from database
        // -----------------------------------------

        const amount = Math.round(ride.fare * 100);

        // -----------------------------------------
        // 8. Create Razorpay order
        // -----------------------------------------

        const razorpayOrder =
            await Razorpay.orders.create({
                amount,
                currency: "INR",
                receipt: `ride_${ride._id}`,

                notes: {
                    rideId: ride._id.toString(),
                    userId: req.user.id.toString()
                }
            });

        // -----------------------------------------
        // 9. Create our payment record
        // -----------------------------------------

        let payment;

        try {
            payment = await Payment.create({
                ride: ride._id,
                user: req.user.id,
                amount: ride.fare,
                currency: "INR",
                razorpayOrderId: razorpayOrder.id,
                status: "created",
                active: true
            });
        } catch (error) {

            // Another request created the active payment first
            if (error.code === 11000) {

                const existingPayment = await Payment.findOne({
                    ride: ride._id,
                    user: req.user.id,
                    active: true,
                    status: {
                        $in: [
                            "created",
                            "pending",
                            "authorized"
                        ]
                    }
                }).sort({
                    createdAt: -1
                });

                if (existingPayment) {
                    return res.status(200).json({
                        success: true,
                        message: "Existing payment order returned",
                        payment: {
                            paymentId: existingPayment._id,
                            orderId:
                                existingPayment.razorpayOrderId,
                            amount:
                                Math.round(
                                    existingPayment.amount * 100
                                ),
                            currency:
                                existingPayment.currency
                        }
                    });
                }
            }

            throw error;
        }



        // -----------------------------------------
        // 10. Send order details to frontend
        // -----------------------------------------

        return res.status(201).json({
            success: true,
            message: "Payment order created",

            payment: {
                paymentId: payment._id,
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            }
        });

    } catch (error) {

        console.error(
            "Create payment order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create payment order"
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // 1. Check required fields
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are required"
            });
        }

        // 2. Find our payment record
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            user: req.user.id
        }).populate("ride")

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found"
            });
        }

        if (payment.status === "paid") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                payment: {
                    paymentId: payment._id,
                    razorpayPaymentId: payment.razorpayPaymentId,
                    status: payment.status
                }
            });
        }

        // 3. Generate signature ourselves
        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        // 4. Safely compare signatures
        const generatedBuffer =
            Buffer.from(generatedSignature);

        const receivedBuffer =
            Buffer.from(razorpay_signature);

        const isValid =
            generatedBuffer.length === receivedBuffer.length &&
            crypto.timingSafeEqual(
                generatedBuffer,
                receivedBuffer
            );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // ------------------------------------------------
        // Signature is valid from here
        // ------------------------------------------------

        // 5. Ask Razorpay for the actual payment
        const razorpayPayment =
            await Razorpay.payments.fetch(
                razorpay_payment_id
            );

        // 6. Check payment belongs to our Razorpay order
        if (
            razorpayPayment.order_id !==
            payment.razorpayOrderId
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment order mismatch"
            });
        }

        // 7. Check amount
        const expectedAmount =
            Math.round(payment.amount * 100);

        if (
            razorpayPayment.amount !== expectedAmount
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment amount mismatch"
            });
        }

        // 8. Check currency
        if (
            razorpayPayment.currency !==
            payment.currency
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment currency mismatch"
            });
        }

        // 9. Check actual payment status
        if (
            razorpayPayment.status !== "captured"
        ) {
            return res.status(400).json({
                success: false,
                message: `Payment is not captured. Current status: ${razorpayPayment.status}`
            });
        }

        // ------------------------------------------------
        // Everything is verified
        // ------------------------------------------------

        const session = await mongoose.startSession();

        try {
            let updatedPayment;
            let ride;

            await session.withTransaction(async () => {
                updatedPayment = await Payment.findOneAndUpdate(
                    {
                        _id: payment._id,
                        status: { $ne: "paid" }
                    },
                    {
                        razorpayPaymentId: razorpay_payment_id,
                        razorpaySignature: razorpay_signature,
                        method: razorpayPayment.method,
                        status: "paid",
                        active: false
                    },
                    {
                        new: true,
                        session
                    }
                );

                if (!updatedPayment) {
                    return;
                }

                ride = await Ride.findOneAndUpdate(
                    {
                        _id: payment.ride._id,
                        user: req.user.id
                    },
                    {
                        paymentStatus: "paid"
                    },
                    {
                        new: true,
                        session
                    }
                ).populate("captain")

                if (!ride) {
                    throw new Error("Ride not found while updating payment");
                }
            });

            if (!updatedPayment) {
                return res.status(200).json({
                    success: true,
                    message: "Payment was already processed"
                });
            }

            if (ride?.captain?.socketId) {
                sendMessageToSocketId(
                    ride.captain.socketId,
                    {
                        event: "online-payment-received",
                        data: ride
                    }
                );
            }

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                payment: {
                    paymentId: updatedPayment._id,
                    razorpayPaymentId:
                        updatedPayment.razorpayPaymentId,
                    status: updatedPayment.status
                },
                ride: {
                    rideId: ride._id,
                    paymentStatus: ride.paymentStatus
                }
            });

        } finally {
            await session.endSession();
        }


    } catch (error) {
        console.error(
            "Payment verification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Payment verification failed"
        });
    }
};


const handleWebhook = async (req, res) => {
    try {
        const webhookSignature =
            req.headers["x-razorpay-signature"];

        const eventId =
            req.headers["x-razorpay-event-id"];

        if (!webhookSignature) {
            return res.status(400).json({
                success: false,
                message: "Webhook signature missing"
            });
        }

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Webhook event ID missing"
            });
        }

        // 1. Verify webhook signature
        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_WEBHOOK_SECRET
            )
            .update(req.body)
            .digest("hex");

        const generatedBuffer =
            Buffer.from(generatedSignature);

        const receivedBuffer =
            Buffer.from(webhookSignature);

        const isValid =
            generatedBuffer.length === receivedBuffer.length &&
            crypto.timingSafeEqual(
                generatedBuffer,
                receivedBuffer
            );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid webhook signature"
            });
        }

        // 2. Parse webhook body only AFTER verification
        const event = JSON.parse(req.body.toString());

        console.log("Webhook event:", event.event);
        console.log("Webhook event ID:", eventId);

        // 3. Idempotency check
        const alreadyProcessed = await Payment.findOne({
            webhookEventId: eventId
        });

        if (alreadyProcessed) {
            console.log("Webhook already processed");

            return res.status(200).json({
                success: true,
                message: "Webhook already processed"
            });
        }

        // 4. Handle payment captured
        if (event.event === "payment.captured") {

            const paymentEntity =
                event.payload.payment.entity;

            const payment = await Payment.findOne({
                razorpayOrderId: paymentEntity.order_id
            });

            if (!payment) {
                console.log(
                    "Payment record not found:",
                    paymentEntity.order_id
                );

                return res.status(404).json({
                    success: false,
                    message: "Payment record not found"
                });
            }

            // Verify amount
            const expectedAmount =
                Math.round(payment.amount * 100);

            if (paymentEntity.amount !== expectedAmount) {
                return res.status(400).json({
                    success: false,
                    message: "Payment amount mismatch"
                });
            }

            // Verify currency
            if (paymentEntity.currency !== payment.currency) {
                return res.status(400).json({
                    success: false,
                    message: "Payment currency mismatch"
                });
            }
            const session = await mongoose.startSession();

            try {
                let updatedPayment;
                let ride;

                await session.withTransaction(async () => {
                    updatedPayment = await Payment.findOneAndUpdate(
                        {
                            _id: payment._id,
                            status: { $ne: "paid" }
                        },
                        {
                            razorpayPaymentId: paymentEntity.id,
                            method: paymentEntity.method,
                            status: "paid",
                            active: false,
                            webhookEventId: eventId
                        },
                        {
                            new: true,
                            session
                        }
                    );

                    if (!updatedPayment) {
                        return;
                    }

                    ride = await Ride.findByIdAndUpdate(
                        payment.ride,
                        {
                            paymentStatus: "paid"
                        },
                        {
                            new: true,
                            session
                        }
                    ).populate("captain");

                    if (!ride) {
                        throw new Error(
                            "Ride not found while processing webhook"
                        );
                    }
                });

                if (!updatedPayment) {
                    console.log("Payment was already processed");
                    return res.status(200).json({
                        success: true,
                        message: "Payment already processed"
                    });
                }

                if (ride?.captain?.socketId) {
                    sendMessageToSocketId(
                        ride.captain.socketId,
                        {
                            event: "online-payment-received",
                            data: ride
                        }
                    );
                }

                console.log(
                    "Payment marked as paid:",
                    paymentEntity.id
                );

            } finally {
                await session.endSession();
            }
        }

        // 5. Handle failed payment
        if (event.event === "payment.failed") {

            const paymentEntity =
                event.payload.payment.entity;

            const payment = await Payment.findOne({
                razorpayOrderId: paymentEntity.order_id
            });

            if (payment) {

                payment.razorpayPaymentId =
                    paymentEntity.id;

                payment.method =
                    paymentEntity.method;

                payment.status = "failed";
                payment.active = false;

                payment.webhookEventId = eventId;

                await payment.save();

                // Update ride payment status
                await Ride.findOneAndUpdate(
                    {
                        _id: payment.ride,
                        paymentStatus: "pending"
                    },
                    {
                        paymentStatus: "failed"
                    }
                );
            }

            console.log(
                "Payment failed:",
                paymentEntity.id
            );
        }
        return res.status(200).json({
            success: true
        });

    } catch (error) {

        console.error(
            "Webhook processing error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Webhook processing failed"
        });
    }
};


const getPaymentStatus = async (req, res) => {
    try {
        const { rideId } = req.params;

        if (!rideId) {
            return res.status(400).json({
                success: false,
                message: "rideId is required"
            });
        }

        const ride = await Ride.findOne({
            _id: rideId,
            user: req.user.id
        }).select("paymentStatus paymentMethod fare");

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found"
            });
        }

        const payment = await Payment.findOne({
            ride: ride._id,
            user: req.user.id
        })
            .sort({ createdAt: -1 })
            .select(
                "amount currency razorpayOrderId razorpayPaymentId status method createdAt"
            );

        return res.status(200).json({
            success: true,
            ride: {
                rideId: ride._id,
                fare: ride.fare,
                paymentMethod: ride.paymentMethod,
                paymentStatus: ride.paymentStatus
            },
            payment: payment || null
        });

    } catch (error) {
        console.error(
            "Get payment status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get payment status"
        });
    }
};


const confirmCashPayment = async (req, res) => {
    try {
        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({
                success: false,
                message: "rideId is required"
            });
        }

        const ride = await Ride.findOne({
            _id: rideId,
            captain: req.captain._id
        }).populate("user").populate("captain");

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found"
            });
        }

        if (ride.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Ride is not completed yet"
            });
        }

        if (ride.paymentMethod !== "cash") {
            return res.status(400).json({
                success: false,
                message: "This ride does not use cash payment"
            });
        }

        if (ride.paymentStatus === "paid") {
            return res.status(200).json({
                success: true,
                message: "Cash payment already confirmed",
                ride
            });
        }

        if (ride.paymentStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Payment cannot be confirmed. Current status: ${ride.paymentStatus}`
            });
        }

        const updatedRide = await Ride.findOneAndUpdate(
            {
                _id: ride._id,
                captain: req.captain._id,
                status: "completed",
                paymentMethod: "cash",
                paymentStatus: "pending"
            },
            {
                paymentStatus: "paid"
            },
            {
                new: true
            }
        )
            .populate("user")
            .populate("captain");

        if (!updatedRide) {
            return res.status(409).json({
                success: false,
                message: "Payment was already processed"
            });
        }

        sendMessageToSocketId(
            updatedRide.user.socketId,
            {
                event: "cash-payment-received",
                data: updatedRide
            }
        );

        return res.status(200).json({
            success: true,
            message: "Cash payment confirmed",
            ride: updatedRide
        });

    } catch (error) {
        console.error(
            "Confirm cash payment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to confirm cash payment"
        });
    }
};


export {
    createOrder,
    verifyPayment,
    handleWebhook,
    getPaymentStatus,
    confirmCashPayment
};