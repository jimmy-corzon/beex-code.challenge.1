import express from "express"
import { schemaValidator } from "../../middlewares"
import { createGameSchema, getGameSchema, listGamesSchema, reportGameResultSchema, updateGameSchema } from "./games.schema"
import { GameController } from "./games.controller"
import { matchmakingRouter } from "./matchmaking/matchmaking.routes"

const router = express.Router()

const gameController = new GameController()

// Emparejamiento
router.use("/matchmaking", matchmakingRouter)

// Crear juego
router.post("/", [schemaValidator(createGameSchema)], gameController.createGame)

// Actualizar juego
router.patch("/:id", [schemaValidator(updateGameSchema)], gameController.updateGame)

// Eliminar juego
router.delete("/:id", [schemaValidator(getGameSchema)], gameController.deleteGameHard)

// Obtener juego por Id
router.get("/:id", [schemaValidator(getGameSchema)], gameController.getGameById)

// Listar juegos
router.get("/", [schemaValidator(listGamesSchema)], gameController.listGames)

// Reportar resultado del juego
router.patch("/:id/report", [schemaValidator(reportGameResultSchema)], gameController.reportGameResult)

export const gamesRouter = router
