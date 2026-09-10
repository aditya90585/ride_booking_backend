import { validationResult } from "express-validator";
import { confirmRide, createRide, endRide, getFare, startRide } from "../services/ride.service.js";
import { getAddressCoordinate, getCaptainsInTheRadius } from "../services/maps.service.js";
import Ride from "../models/ride.model.js";
import { sendMessageToSocketId } from "../socket/socket.js";

const createRideController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { pickupLocation, destination, vehicleType } = req.body;
        const userId = req.user.id;
        if (!pickupLocation || !destination || !vehicleType) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const ride = await createRide({ userId, pickupLocation, destination, vehicleType });
        res.status(201).json({ success: true, ride });

        const pickUpCoordinates = await getAddressCoordinate(pickupLocation)

        const captainsInRadius = await getCaptainsInTheRadius(pickUpCoordinates?.ltd, pickUpCoordinates?.lng, 90)

        const rideWithUser = await Ride.findOne({ _id: ride._id }).populate('user').select("-otp");

        captainsInRadius.map((captain) => {
            sendMessageToSocketId(captain.socketId, { event: "new-ride", data: rideWithUser })
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message });
    }
}

const calculateFare = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { origin, destination } = req.query;

        if (!origin || !destination) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const fare = await getFare(origin, destination);
        return res.status(200).json({ success: true, fare });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const confirmRideController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId } = req.body

        const ride = await confirmRide({ rideId, captain: req.captain })
        sendMessageToSocketId(ride.user.socketId, { event: "ride-confirmed", data: ride })
        return res.status(200).json(ride)
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "error in confirm ride" });
    }
}

const startRideController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { rideId, otp } = req.body
        const ride = await startRide({ rideId, otp, captain: req.captain })
        sendMessageToSocketId(ride.user.socketId, { event: "ride-started", data: ride })
        return res.status(200).json(ride)
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "error in start ride" });
    }
}

const endRideController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { rideId } = req.body
        const ride = await endRide({ rideId, captain: req.captain })
        sendMessageToSocketId(ride.user.socketId, { event: "ride-ended", data: ride })
        return res.status(200).json(ride)
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "error in end ride" });
    }
}

export { createRideController, calculateFare, confirmRideController, startRideController, endRideController };