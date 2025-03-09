import { Game, Player, Prisma, PrismaClient } from "@prisma/client"
import { ListGamesWhere, ReportGameResultInput } from "./games.schema"
import { PageContext } from "../../types/pagination"
import { PlayerService } from "../players/players.service"

/**
 * Clase que contiene los servicios de Game
 * Esta clase se encarga de manejar las operaciones CRUD de la entidad Juego
 */
export class GameService {
  private db: PrismaClient
  private playerService: PlayerService
  private winFactor = 0.7
  private gamesPlayedFactor = 0.3

  /**
   * Constructor
   * @param {PrismaClient} prisma - Instancia de PrismaClient
   */
  constructor(prisma: PrismaClient) {
    this.db = prisma
    this.playerService = new PlayerService(prisma)
  }

  /**
   * Calcula el ranking de un jugador basado en juegos jugados y ganados.
   * @param {Player} player - Objeto Player
   * @return {number} - Nuevo ranking calculado
   * @private
   */
  private calculateRanking(player: Player): number {
    const winPercentage = player.games_played > 0 ? player.games_won / player.games_played : 0
    const ranking =
      (winPercentage * this.winFactor + (player.games_played > 0 ? player.games_played : 0) * this.gamesPlayedFactor) *
      player.initial_ranking
    return Math.max(0, Math.round(ranking))
  }

  /**
   * Reportar resultado del juego
   * @param {Omit<Prisma.GameUncheckedUpdateInput, "">} input - Datos del juego
   */
  async createGame(input: Omit<Prisma.GameUncheckedCreateInput, "status">): Promise<Game> {
    return this.db.game.create({
      data: {
        ...input,
      },
    })
  }

  /**
   * Actualizar juego
   * @param {string} id - ID del juego
   * @param {Omit<Prisma.GameUncheckedUpdateInput, "">} input - Datos del juego
   */
  async updateGame(id: string, input: Omit<Prisma.GameUncheckedUpdateInput, "status">): Promise<Game> {
    // Si el estado del juego es cerrado, no se puede actualizar
    const game = await this.db.game.findUnique({
      where: { id },
    })

    if (!game) {
      throw new Error(`Juego con ID ${id} no encontrado`)
    }
    if (game.status === "closed") {
      throw new Error(`El juego con ID ${id} está cerrado y no se puede actualizar`)
    }

    return this.db.game.update({
      where: {
        id,
      },
      data: {
        ...input,
      },
    })
  }

  /**
   * Eliminar juego (Hard Delete)
   * @param {string} id - ID del juego
   */
  async deleteGameHard(id: string): Promise<Game> {
    return this.db.game.delete({
      where: {
        id,
        status: { not: "closed" },
      },
    })
  }

  /**
   * Obtener juego por Id
   * @param {string} id - ID del juego
   */
  async getGameById(id: string): Promise<Game | null> {
    return this.db.game.findUnique({
      where: { id },
      include: {
        players: true,
      },
    })
  }

  /**
   * Listar juegos
   * @param {ListGamesWhere} params - Parámetros de búsqueda
   */
  async listGames(params: {
    page?: number
    pageSize?: number
    where?: ListGamesWhere
    orderBy?: Prisma.GameOrderByWithRelationInput
  }): Promise<{
    games: Game[]
    page_context: PageContext
  }> {
    const { page = 1, pageSize = 100, where, orderBy } = params

    const skip = (page - 1) * pageSize

    const where_formatted: Prisma.GameWhereInput = {}

    // Añade filtros dinámicos basados en los campos de la entidad
    if (where?.title) {
      where_formatted.title = {
        contains: where.title,
        mode: "insensitive",
      }
    }

    const [games, totalGames] = await Promise.all([
      this.db.game.findMany({
        skip,
        take: pageSize,
        orderBy,
        where: {
          ...where_formatted,
        },
      }),
      this.db.game.count({
        where: {
          ...where_formatted,
        },
      }),
    ])

    return {
      games,
      page_context: {
        page,
        per_page: pageSize,
        has_more_page: page * pageSize < totalGames,
      },
    }
  }

  /**
   * Reportar resultado del juego y actualizar rankings de jugadores.
   * @param {string} id - ID del juego
   * @param {ReportGameResultInput} input - Datos del reporte del juego (winner_ids)
   * @return {Promise<Game>} - Juego actualizado con el resultado reportado
   */
  async reportGameResult(id: string, input: ReportGameResultInput): Promise<Game> {
    const game = await this.db.game.findUnique({
      where: { id },
      include: { players: true },
    })

    if (!game) {
      throw new Error(`Juego con ID ${id} no encontrado`)
    }

    const winnerIds = input.winner_ids
    const gamePlayers = game.players

    // Actualizar games_played y games_won y ranking para cada jugador en el juego
    await Promise.all(
      gamePlayers.map(async (player) => {
        let updatedGamesWon = player.games_won
        const isWinner = winnerIds.includes(player.id)

        if (isWinner) {
          updatedGamesWon += 1
        }

        const updatedPlayer = await this.db.player.update({
          where: { id: player.id },
          data: {
            games_played: { increment: 1 },
            games_won: isWinner ? { set: updatedGamesWon } : { set: player.games_won },
          },
          include: { games: true },
        })

        if (updatedPlayer) {
          const newRanking = this.calculateRanking(updatedPlayer)
          await this.playerService.updatePlayerRanking(player.id, newRanking)
        }
      }),
    )

    // Actualizar el juego con los IDs de los ganadores
    return this.db.game.update({
      where: { id },
      data: {
        winner_ids: { set: winnerIds },
        status: "closed",
      },
    })
  }
}
