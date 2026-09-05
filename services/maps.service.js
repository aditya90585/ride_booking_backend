import axios from "axios";
// import captainModel from "../models/captain.model.js";
import dotenv from "dotenv"
dotenv.config()

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
const GEOCODING_URL = "https://api.geoapify.com/v1/geocode/search";
const AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";
const ROUTING_URL = "https://api.geoapify.com/v1/routing";

const getAddressCoordinate = async (address) => {
    if (!address) throw new Error("Address is required");
    if (!GEOAPIFY_API_KEY) throw new Error("GEOAPIFY_API_KEY is not configured");

    try {
        const response = await axios.get(GEOCODING_URL, {
            params: {
                text: address,
                format: "json",
                apiKey: GEOAPIFY_API_KEY,
                limit: 1
            }
        });

        if (!response.data?.results?.length) {
            throw new Error("Unable to fetch coordinates");
        }

        const location = response.data.results[0];

        return {
            ltd: location.lat,
            lng: location.lon
        };
    } catch (error) {
        console.error(
            "Geoapify Geocoding Error:",
            error.response?.data || error.message
        );
        throw new Error("Unable to fetch coordinates");
    }
};

const getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error("Origin and destination are required");
    }

    if (!GEOAPIFY_API_KEY) {
        throw new Error("GEOAPIFY_API_KEY is not configured");
    }

    try {
        const originCoordinates = await getAddressCoordinate(origin);
        const destinationCoordinates = await getAddressCoordinate(destination);

        const waypoints =
            `${originCoordinates.ltd},${originCoordinates.lng}|` +
            `${destinationCoordinates.ltd},${destinationCoordinates.lng}`;

        const response = await axios.get(ROUTING_URL, {
            params: {
                waypoints,
                mode: "drive",
                format:"json",
                apiKey: GEOAPIFY_API_KEY
            }
        });

        if (!response.data?.results?.length) {
            throw new Error("No routes found");
        }

        const route = response.data.results[0];
        const distance = route.distance;
        const duration = route.time;

        return {
            distance: {
                text: `${(distance / 1000).toFixed(1)} km`,
                value: distance
            },
            duration: {
                text: `${Math.round(duration / 60)} mins`,
                value: duration
            },
            status: "OK"
        };
    } catch (error) {
        console.error(
            "Geoapify Routing Error:",
            error.response?.data || error.message
        );
        throw new Error(error.message || "Unable to fetch distance and time");
    }
};

const getAutoCompleteSuggestions = async (input) => {
    if (!input) throw new Error("query is required");
    if (!GEOAPIFY_API_KEY) throw new Error("GEOAPIFY_API_KEY is not configured");

    try {
        const response = await axios.get(AUTOCOMPLETE_URL, {
            params: {
                text: input,
                format:"json",
                apiKey: GEOAPIFY_API_KEY,
                limit: 5
            }
        });

        if (!response.data?.results) {
            throw new Error("Unable to fetch suggestions");
        }

        return response.data.results
            .map(place => place.formatted || place.address_line1 || place.name)
            .filter(Boolean);
    } catch (error) {
        console.error(
            "Geoapify Autocomplete Error:",
            error.response?.data || error.message
        );
        throw new Error("Unable to fetch suggestions");
    }
};

// const getCaptainsInTheRadius = async (ltd, lng, radius) => {
//     const captains = await captainModel.find({
//         location: {
//             $geoWithin: {
//                 $centerSphere: [[ltd, lng], radius / 6371]
//             }
//         }
//     });

//     return captains;
// };

export {
    getAddressCoordinate,
    getDistanceTime,
    getAutoCompleteSuggestions,
    // getCaptainsInTheRadius
};

