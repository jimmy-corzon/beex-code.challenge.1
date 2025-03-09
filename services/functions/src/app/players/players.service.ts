import { Player, Prisma, PrismaClient } from "@prisma/client"
import { ListPlayersWhere } from "./players.schema"
import { PageContext } from "../../types/pagination"

/**
 * Clase que contiene los servicios de Player
 * Esta clase se encarga de manejar las operaciones CRUD de la entidad Jugador
 */
export class PlayerService {
  private db: PrismaClient
  private defaultInitialRanking = 1000 // Ranking inicial por defecto

  /**
   * Constructor
   * @param {PrismaClient} prisma - Instancia de PrismaClient
   */
  constructor(prisma: PrismaClient) {
    this.db = prisma
  }

  /**
   * Calcula el porcentaje de completitud del perfil de un jugador.
   * Considera los campos: name, latitude, longitude
   * @param {Player} player - Objeto Player
   * @return {number} - Porcentaje de completitud (0-100)
   * @private
   */
  private calculateProfileCompletion(player: Prisma.PlayerUncheckedCreateInput | Prisma.PlayerUncheckedUpdateInput): number {
    const totalFields = 5 // name, email, description, latitude, longitude

    let completedFields = 0

    if (player.name) completedFields++
    if (player.email) completedFields++
    if (player.description) completedFields++
    if (player.latitude != null) completedFields++
    if (player.longitude != null) completedFields++

    return (completedFields / totalFields) * 100
  }

  /**
   * Actualizar el ranking de un jugador.
   * @param {string} id - ID del jugador
   * @param {number} ranking - Nuevo ranking del jugador
   * @return {Promise<Player>} - Objeto de Player actualizado
   */
  async updatePlayerRanking(id: string, ranking: number): Promise<Player> {
    return this.db.player.update({
      where: {
        id,
      },
      data: {
        ranking: { set: ranking }, // Actualizar solo el campo ranking
      },
    })
  }

  /**
   * Crear jugador
   * @param {Omit<Prisma.PlayerUncheckedCreateInput, "ranking" | "profile_completion" | "games_played" | "games_won" | "initial_ranking">} input - Datos del jugador
   * @return {Promise<Player>} - Objeto de Player creado
   */
  async createPlayer(
    input: Omit<Prisma.PlayerUncheckedCreateInput, "ranking" | "profile_completion" | "games_played" | "games_won" | "initial_ranking">,
  ): Promise<Player> {
    // Calcula el porcentaje de completitud del perfil de un jugador
    const profileCompletionPercentage = this.calculateProfileCompletion(input)

    // Crear jugador en la base de datos
    return this.db.player.create({
      data: {
        ...input,
        initial_ranking: this.defaultInitialRanking,
        ranking: this.defaultInitialRanking,
        profile_completion: profileCompletionPercentage,
      },
    })
  }

  /**
   * Actualizar jugador
   * @param {string} id - ID del jugador
   * @param {Omit<Prisma.PlayerUncheckedUpdateInput, "ranking" | "profile_completion" | "games_played" | "games_won" | "initial_ranking">} input - Datos del jugador
   * @return {Promise<Player>} - Objeto de Player actualizado
   */
  async updatePlayer(
    id: string,
    input: Omit<Prisma.PlayerUncheckedUpdateInput, "ranking" | "profile_completion" | "games_played" | "games_won" | "initial_ranking">,
  ): Promise<Player> {
    // Obtener jugador por Id
    const player = await this.db.player.findUnique({
      where: { id },
    })

    // Calcula el porcentaje de completitud del perfil de un jugador
    const profileCompletionPercentage = this.calculateProfileCompletion({ ...player, ...input })

    // Actualizar jugador en la base de datos
    return this.db.player.update({
      where: {
        id,
      },
      data: {
        ...input,
        profile_completion: profileCompletionPercentage,
      },
    })
  }

  /**
   * Eliminar jugador (Hard Delete)
   * @param {string} id - ID del jugador
   * @return {Promise<Player>} - Objeto de Player eliminado
   */
  async deletePlayerHard(id: string): Promise<Player> {
    // Eliminar jugador en la base de datos
    return this.db.player.delete({
      where: {
        id,
      },
    })
  }

  /**
   * Obtener jugador por Id
   * @param {string} id - ID del jugador
   * @return {Promise<Player | null>} - Objeto de Player o null
   */
  async getPlayerById(id: string): Promise<Player | null> {
    // Obtener jugador por Id de la base de datos
    return this.db.player.findUnique({
      where: { id },
      include: {
        games: true,
      },
    })
  }

  /**
   * Listar jugadores
   * @param {ListPlayersWhere} params - Parámetros de búsqueda
   * @return {Promise<{ players: Player[], page_context: PageContext }>} - Objeto de Players y contexto de paginación
   */
  async listPlayers(params: {
    page?: number
    pageSize?: number
    where?: ListPlayersWhere
    orderBy?: Prisma.PlayerOrderByWithRelationInput
  }): Promise<{
    players: Player[]
    page_context: PageContext
  }> {
    const { page = 1, pageSize = 100, where, orderBy } = params

    const skip = (page - 1) * pageSize

    const where_formatted: Prisma.PlayerWhereInput = {}

    // Añade filtros dinámicos basados en los campos de la entidad
    // Ejemplo para títulos o nombres (ajusta según tu modelo)
    if (where?.name) {
      where_formatted.name = {
        contains: where.name,
        mode: "insensitive",
      }
    }

    if (where?.email) {
      where_formatted.email = {
        contains: where.email,
        mode: "insensitive",
      }
    }

    if (where?.not_email) {
      where_formatted.email = {
        not: {
          contains: where.not_email,
        },
      }
    }

    if (where?.latitude) {
      where_formatted.latitude = {
        equals: where.latitude,
      }
    }

    if (where?.longitude) {
      where_formatted.longitude = {
        equals: where.longitude,
      }
    }

    // Obtener jugadores de la base de datos y contar el total de jugadores
    const [players, totalPlayers] = await Promise.all([
      this.db.player.findMany({
        skip,
        take: pageSize,
        orderBy,
        where: {
          ...where_formatted,
        },
      }),
      this.db.player.count({
        where: {
          ...where_formatted,
        },
      }),
    ])

    return {
      players,
      page_context: {
        page,
        per_page: pageSize,
        has_more_page: page * pageSize < totalPlayers,
      },
    }
  }
}
