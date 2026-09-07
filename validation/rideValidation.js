import { body } from "express-validator";

export const createRideValidation = [
    body("pickupLocation")
        .notEmpty()
        .withMessage("Pickup location is required")
        .isLength({ min: 3 })
        .withMessage("Pickup location must be at least 3 characters long"),
    body("destination")
        .notEmpty()
        .withMessage("Destination is required")
        .isLength({ min: 3 })
        .withMessage("Destination must be at least 3 characters long"),
    body("vehicleType")
        .notEmpty()
        .withMessage("Vehicle type is required")
        .isIn(["auto", "car", "moto"])
        .withMessage("Vehicle type must be one of the following: auto, car, moto")
]