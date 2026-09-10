import { validationResult } from "express-validator";
import { getAddressCoordinate, getAddressFromCoordinates, getAutoCompleteSuggestions, getDistanceTime,getRoute } from "../services/maps.service.js";

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


 const getAddressFromCoordinatesController = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        const address = await getAddressFromCoordinates(lat, lng);

        res.status(200).json({ address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to get address" });
    }
};

const getRouteController = async (req, res) => {
    try {
        const { origin,destination } = req.query;
 console.log(origin,destination)
        const route = await getRoute(origin,destination);
        res.status(200).json({ route });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to get route" });
    }
};

export { getCoordinates, getDistanceTimeController, getAutoCompleteSuggestionsController,getAddressFromCoordinatesController, getRouteController }