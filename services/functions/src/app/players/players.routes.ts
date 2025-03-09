import express from "express"
import { schemaValidator } from "../../middlewares"
import { createPlayerSchema, getPlayerSchema, listPlayersSchema, updatePlayerSchema } from "./players.schema"
import { PlayerController } from "./players.controller"

const router = express.Router()

const playerController = new PlayerController()

// Crear jugador
router.post("/", [schemaValidator(createPlayerSchema)], playerController.createPlayer)

// Actualizar jugador
router.patch("/:id", [schemaValidator(updatePlayerSchema)], playerController.updatePlayer)

// Eliminar jugador
router.delete("/:id", [schemaValidator(getPlayerSchema)], playerController.deletePlayerHard)

// Obtener jugador por Id
router.get("/:id", [schemaValidator(getPlayerSchema)], playerController.getPlayerById)

// Listar jugadores
router.get("/", [schemaValidator(listPlayersSchema)], playerController.listPlayers)

export const playersRouter = router
