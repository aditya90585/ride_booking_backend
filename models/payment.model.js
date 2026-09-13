import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        ride: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride",
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        razorpayOrderId: {
            type: String,
            required: true,
            unique: true
        },

        razorpayPaymentId: {
            type: String,
            default: null
        },

        razorpaySignature: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: [
                "created",
                "pending",
                "authorized",
                "paid",
                "failed",
                "refunded"
            ],
            default: "created"
        },
        active: {
            type: Boolean,
            default: true
        },

        webhookEventId: {
            type: String,
            unique: true,
            sparse: true
        },

        method: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

paymentSchema.index(
    { ride: 1, active: 1 },
    {
        unique: true,
        partialFilterExpression: {
            active: true
        }
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;