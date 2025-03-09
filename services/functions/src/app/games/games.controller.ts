import { Request, Response } from "express"
import { GameService } from "./games.service"
import { db_client } from "../../services/database"
import { DATABASE_URL } from "../../config/env"
import { ApiResponse, ResCodes } from "../../utils/responses"
import { createGameSchema, getGameSchema, listGamesSchema, reportGameResultSchema, updateGameSchema } from "./games.schema"
import { Prisma } from "@prisma/client"

/**
 * Controlador de Games
 * Este controlador se encarga de manejar las operaciones CRUD de la entidad Juego
 */
export class GameController {
  private gameService: GameService

  /**
   * Constructor
   */
  constructor() {
    const db = db_client(DATABASE_URL)
    this.gameService = new GameService(db)
  }

  // Crear juego
  public createGame = async (req: Request, res: Response) => {
    try {
      const { player_ids, ...input } = createGameSchema.parse(req).body

      const players = player_ids.map((id) => {
        return { id }
      })

      const response = await this.gameService.createGame({
        ...input,
        players: {
          connect: players,
        },
      })

      return ApiResponse.init(res).json(201, {
        code: ResCodes.OK,
        message: "Juego creado exitosamente",
        data: response,
      })
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudo crear el juego")
    }
  }

  // Actualizar juego
  public updateGame = async (req: Request, res: Response) => {
    try {
      const {
        params: { id },
        body: { add_player_ids, ...input },
      } = updateGameSchema.parse(req)

      const new_input: Prisma.GameUncheckedUpdateInput = { ...input }
      if (add_player_ids) {
        const players = add_player_ids.map((id) => {
          return { id }
        })
        new_input.players = {
          connect: players,
        }
      }

      const response = await this.gameService.updateGame(id, input)

      return ApiResponse.init(res).json(200, {
        code: ResCodes.OK,
        message: "Juego actualizado exitosamente",
        data: response,
      })
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudo actualizar el juego")
    }
  }

  // Eliminar juego (Hard Delete)
  public deleteGameHard = async (req: Request, res: Response) => {
    try {
      const { id } = getGameSchema.parse(req).params

      const response = await this.gameService.deleteGameHard(id)

      return ApiResponse.init(res).json(200, {
        code: ResCodes.OK,
        message: "Juego eliminado permanentemente",
        data: response,
      })
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudo eliminar permanentemente el juego")
    }
  }

  // Obtener juego por Id
  public getGameById = async (req: Request, res: Response) => {
    try {
      const { id } = getGameSchema.parse(req).params

      const response = await this.gameService.getGameById(id)

      if (response !== null) {
        return ApiResponse.init(res).json(200, {
          code: ResCodes.OK,
          message: "Juego obtenido exitosamente",
          data: response,
        })
      } else {
        return ApiResponse.init(res).json(404, {
          code: ResCodes.NOT_FOUND,
          message: "Juego no encontrado",
        })
      }
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudo obtener el juego")
    }
  }

  // Listar juegos
  public listGames = async (req: Request, res: Response) => {
    try {
      const { _page, _per_page, _order, _sort, ...filters } = listGamesSchema.parse(req).query

      const response = await this.gameService.listGames({
        page: _page ? Number(_page) : 1,
        pageSize: _per_page ? Number(_per_page) : 100,
        orderBy: _sort ? { [_sort]: _order || "asc" } : undefined,
        where: filters,
      })

      if (response && response.games.length > 0) {
        return ApiResponse.init(res).json(200, {
          code: ResCodes.OK,
          message: "Juegos obtenidos exitosamente",
          data: response,
        })
      } else {
        return ApiResponse.init(res).json(404, {
          code: ResCodes.NOT_FOUND,
          message: "No se encontraron juegos",
          data: response,
        })
      }
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se pudieron obtener los juegos")
    }
  }

  // Reportar resultado del juego
  public reportGameResult = async (req: Request, res: Response) => {
    try {
      const { id } = reportGameResultSchema.parse(req).params
      const input = reportGameResultSchema.parse(req).body

      const response = await this.gameService.reportGameResult(id, input)

      return ApiResponse.init(res).json(200, {
        code: ResCodes.OK,
        message: "Juego guardado exitosamente",
        data: response,
      })
    } catch (err) {
      return ApiResponse.init(res).handleError(err, "No se puede guardar el juego")
    }
  }
}
