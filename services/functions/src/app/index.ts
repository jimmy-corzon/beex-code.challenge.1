import express from "express"
import { logger } from "../utils/logger"
import { playersRouter } from "./players/players.routes"
import { ApiResponse, ResCodes } from "../utils/responses"
import { gamesRouter } from "./games/games.routes"

const router = express.Router()

// Jugadores
router.use("/players", playersRouter)

// Juegos
router.use("/games", gamesRouter)

// Prueba de ping
router.get("/ping", (req, res) => {
  logger.info("📡 ping: ", req.ip)
  return ApiResponse.init(res).json(200, { code: ResCodes.OK, message: "OK", data: "pong" })
})

export const appRouter = router
