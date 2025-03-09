import { Request, Response } from "express"
import { PlayerService } from "./players.service"
import { db_client } from "../../services/database"
import { DATABASE_URL } from "../../config/env"
import { ApiResponse, ResCodes } from "../../utils/responses"
import { createPlayerSchema, getPlayerSchema, listPlayersSchema, updatePlayerSchema } from "./players.schema"

/**
 * Controlador de Players
 * Este controlador se encarga de manejar las operaciones CRUD de la entidad Jugador
 */
export class PlayerController {
  private playerService: PlayerService

  /**
   * Constructor
   */
  constructor() {
    const db = db_client(DATABASE_URL)
    this.playerService = new PlayerService(db)
  }

  // Crear jugador
  public createPlayer = async (req: Request, res: Response) => {
    try {
      const input = createPlayerSchema.parse(req).body

      const response = await this.playerService.createPlayer(input)

      return ApiResponse.init(res).json(201, {
        code: ResCodes.OK,
        message: "Jugador creado exitosamente",
        data: response,
      })
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudo crear el jugador")
    }
  }

  // Actualizar jugador
  public updatePlayer = async (req: Request, res: Response) => {
    try {
      const {
        params: { id },
        body: input,
      } = updatePlayerSchema.parse(req)

      const response = await this.playerService.updatePlayer(id, input)

      return ApiResponse.init(res).json(200, {
        code: ResCodes.OK,
        message: "Jugador actualizado exitosamente",
        data: response,
      })
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudo actualizar el jugador")
    }
  }

  // Eliminar jugador (Hard Delete)
  public deletePlayerHard = async (req: Request, res: Response) => {
    try {
      const { id } = getPlayerSchema.parse(req).params

      const response = await this.playerService.deletePlayerHard(id)

      return ApiResponse.init(res).json(200, {
        code: ResCodes.OK,
        message: "Jugador eliminado permanentemente",
        data: response,
      })
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudo eliminar permanentemente el jugador")
    }
  }

  // Obtener jugador por Id
  public getPlayerById = async (req: Request, res: Response) => {
    try {
      const { id } = getPlayerSchema.parse(req).params

      const response = await this.playerService.getPlayerById(id)

      if (response !== null) {
        return ApiResponse.init(res).json(200, {
          code: ResCodes.OK,
          message: "Jugador obtenido exitosamente",
          data: response,
        })
      } else {
        return ApiResponse.init(res).json(404, {
          code: ResCodes.NOT_FOUND,
          message: "Jugador no encontrado",
        })
      }
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudo obtener el jugador")
    }
  }

  // Listar jugadores
  public listPlayers = async (req: Request, res: Response) => {
    try {
      const { _page, _per_page, _order, _sort, ...filters } = listPlayersSchema.parse(req).query

      const response = await this.playerService.listPlayers({
        page: _page ? Number(_page) : 1,
        pageSize: _per_page ? Number(_per_page) : 100,
        orderBy: _sort ? { [_sort]: _order || "asc" } : undefined,
        where: filters,
      })

      if (response && response.players.length > 0) {
        return ApiResponse.init(res).json(200, {
          code: ResCodes.OK,
          message: "Jugadores obtenidos exitosamente",
          data: response,
        })
      } else {
        return ApiResponse.init(res).json(404, {
          code: ResCodes.NOT_FOUND,
          message: "No se encontraron players",
          data: response,
        })
      }
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudieron obtener los jugadores")
    }
  }
}
