import { validationResult } from "express-validator";
import { getAddressCoordinate, getAutoCompleteSuggestions, getDistanceTime } from "../services/maps.service.js";

const getCoordinates = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Address is required"
            });
        }

        // Call the service function to get coordinates
        const coordinates = await getAddressCoordinate(address);

        res.status(200).json({
            success: true,
            message: "Coordinates fetched successfully",
            data: coordinates
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occurred while fetching coordinates"
        });
    }
};

const getDistanceTimeController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { origin, destination } = req.query
        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                message: "Origin and destination is required"
            });
        }
        const distanceTime = await getDistanceTime(origin, destination)
        res.status(200).json({
            distanceTime
        })
    } catch (error) {

    }
}
const getAutoCompleteSuggestionsController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { input } = req.query
        if (!input) {
            return res.status(400).json({
                success: false,
                message: "Input is required"
            });
        }
        const suggestion = await getAutoCompleteSuggestions(input)
        res.status(200).json({ suggestion })
    } catch (error) {

    }
}
export { getCoordinates, getDistanceTimeController, getAutoCompleteSuggestionsController }