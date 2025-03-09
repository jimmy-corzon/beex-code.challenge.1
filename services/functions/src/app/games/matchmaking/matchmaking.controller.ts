import { Request, Response } from "express"
import { MatchmakingService } from "./matchmaking.service"
import { db_client } from "../../../services/database"
import { DATABASE_URL } from "../../../config/env"
import { ApiResponse, ResCodes } from "../../../utils/responses"
import { requestMatchmakingSchema } from "./matchmaking.schema"

/**
 * Controlador de Matchmaking
 * Este controlador se encarga de manejar las operaciones del Emparejamiento de juegos
 */
export class MatchmakingController {
  private matchmakingService: MatchmakingService

  /**
   * Constructor
   */
  constructor() {
    const db = db_client(DATABASE_URL)
    this.matchmakingService = new MatchmakingService(db)
  }

  // Solicitar Matchmaking
  public requestMatchmaking = async (req: Request, res: Response) => {
    try {
      const input = requestMatchmakingSchema.parse(req).body

      const response = await this.matchmakingService.requestMatchmaking(input.player_id)

      return ApiResponse.init(res).json(200, {
        code: ResCodes.OK,
        message: "Solicitud de matchmaking.",
        data: response,
      })
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudo procesar la solicitud de matchmaking")
    }
  }
}
