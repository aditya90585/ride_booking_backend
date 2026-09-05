import {query } from "express-validator"

export const getCoordinatesValidation = [
    query("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 3 })
    .withMessage("Address must be at least 3 characters long")
]

export const getDistanceTimeValidation = [
    query("origin")
    .notEmpty()
    .withMessage("Origin is required"),
    query("destination")
    .notEmpty()
    .withMessage("Destination is required")
]

export const getAutoCompleteSuggestionsValidation = [
    query("input")
    .notEmpty()
    .withMessage("Input is required")
    .isLength({ min: 3 })
    .withMessage("Input must be at least 3 characters long")
]