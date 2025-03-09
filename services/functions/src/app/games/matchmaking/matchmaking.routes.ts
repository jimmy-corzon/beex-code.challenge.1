import express from "express"
import { schemaValidator } from "../../../middlewares"
import { requestMatchmakingSchema } from "./matchmaking.schema"
import { MatchmakingController } from "./matchmaking.controller"

const router = express.Router()

const matchmakingController = new MatchmakingController()

// Solicitar emparejamiento
router.post("/request", [schemaValidator(requestMatchmakingSchema)], matchmakingController.requestMatchmaking)

export const matchmakingRouter = router
