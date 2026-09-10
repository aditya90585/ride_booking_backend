import express from "express"
import { authMiddleware } from "../middleware/auth.midleware.js"
import { getAutoCompleteSuggestionsValidation, getCoordinatesValidation, getDistanceTimeValidation } from "../validation/mapsValidation.js"
import { getAddressFromCoordinatesController, getAutoCompleteSuggestionsController, getCoordinates, getDistanceTimeController, getRouteController } from "../controllers/maps.controller.js"


const router = express.Router()

router.get("/get-coordinates", getCoordinatesValidation, getCoordinates)
router.get("/get-distance-time", getDistanceTimeValidation, getDistanceTimeController)
router.get("/get-suggestions", getAutoCompleteSuggestionsValidation, getAutoCompleteSuggestionsController)
router.get("/reverse-geocode",getAddressFromCoordinatesController);
router.get("/get-route", getRouteController);

export default router