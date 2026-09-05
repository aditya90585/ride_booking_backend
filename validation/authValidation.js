import { body } from "express-validator";

export const signUpValidation = [
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
        .withMessage("Password must be at least 6 characters")
];

export const loginValidation = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
]