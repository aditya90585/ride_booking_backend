import { body } from "express-validator";

export const captainSignUpValidation = [
    body("firstName")
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("First name must be between 3 and 100 characters"),
    body("lastName")
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Last name must be between 3 and 100 characters"),
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("color")
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Color is required"),
    body("plate")
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Plate is required"),
    body("capacity")
        .notEmpty()
        .withMessage("Capacity is required")
        .isInt({ min: 1 })
        .withMessage("Capacity must be a positive integer"),
    body("vehicleType")
        .notEmpty()
        .isIn(["car", "motorcycle", "auto"])
        .withMessage("Vehicle type is required")
];



export const captainLoginValidation = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];
