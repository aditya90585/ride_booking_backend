import { validationResult } from "express-validator";
import { createRide, getFare } from "../services/ride.service.js";
import { getAddressCoordinate, getCaptainsInTheRadius } from "../services/maps.service.js";

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
    } catch (error) {
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
export { createRideController, calculateFare };