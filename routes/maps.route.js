import express from "express"
import { authMiddleware } from "../middleware/auth.midleware.js"
import { getAutoCompleteSuggestionsValidation, getCoordinatesValidation, getDistanceTimeValidation } from "../validation/mapsValidation.js"
import { getAutoCompleteSuggestionsController, getCoordinates, getDistanceTimeController } from "../controllers/maps.controller.js"


const router = express.Router()

router.get("/get-coordinates", getCoordinatesValidation, authMiddleware, getCoordinates)
router.get("/get-distance-time", getDistanceTimeValidation, authMiddleware, getDistanceTimeController)
router.get("/get-suggestions", getAutoCompleteSuggestionsValidation, authMiddleware, getAutoCompleteSuggestionsController)

export default router