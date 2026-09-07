import mongoose from "mongoose"

const rideSchema = new mongoose.Schema({
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Captain",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
        default: "pending"
    },
    duration: {
        type: Number
    },
    distance: {
        type: Number
    },
    paymentId: {
        type: String
    },
    orderId: {
        type: String
    },
    signature: {
        type: String,
    },

    otp: {
        type: String,
        select: false,
        required: true,
    },
});

const Ride = mongoose.model("Ride", rideSchema);

export default Ride;