import { PrismaClient } from "@prisma/client/extension"
import { PlayerService } from "../../players/players.service"
import { GameService } from "../games.service"
import { Game, Player } from "@prisma/client"

/**
 * Clase que contiene los servicios de Matchmaking
 * Esta clase se encarga de manejar las operaciones de Emparejamiento de juegos
 */
export class MatchmakingService {
  private playerService: PlayerService
  private gameService: GameService
  private maxDistanceKm = 20
  private rankingDifferenceRange = 200

  /**
   * Constructor
   * @param {PrismaClient} prisma - Instancia de PrismaClient
   */
  constructor(prisma: PrismaClient) {
    this.playerService = new PlayerService(prisma)
    this.gameService = new GameService(prisma)
  }

  /**
   * Calcula la distancia en kilómetros entre dos coordenadas geográficas (latitud y longitud) utilizando la fórmula Haversine.
   * @param {number} lat1 Latitud del punto 1 (en grados)
   * @param {number} lon1 Longitud del punto 1 (en grados)
   * @param {number} lat2 Latitud del punto 2 (en grados)
   * @param {number} lon2 Longitud del punto 2 (en grados)
   * @return {number} Distancia en kilómetros
   * @private
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radio de la Tierra en km
    const φ1 = (lat1 * Math.PI) / 180 // φ, λ en radianes
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  /**
   * Solicita un matchmaking para un jugador.
   * @param {string} playerId - ID del jugador solicitando el matchmaking
   * @return {Promise<Game | { message: string }>} - Objeto de Game o mensaje de error
   */
  async requestMatchmaking(playerId: string): Promise<Game | { message: string }> {
    // 1. Obtener la información del jugador solicitante
    const requestingPlayer = await this.playerService.getPlayerById(playerId)

    if (!requestingPlayer || requestingPlayer === null) {
      return { message: `Jugador con ID ${playerId} no encontrado.` }
    }
    if (requestingPlayer.latitude == null || requestingPlayer.longitude == null) {
      return { message: `Ubicación del jugador ${requestingPlayer.name} no definida. No se puede usar matchmaking por distancia.` }
    }

    // 2. Buscar jugadores compatibles
    const compatiblePlayers: Player[] = []
    const allPlayers = await this.playerService.listPlayers({
      where: {
        not_email: requestingPlayer.email,
      },
    })

    for (const potentialMatch of allPlayers.players) {
      if (potentialMatch.latitude == null || potentialMatch.longitude == null) {
        // Omitir jugadores sin ubicación
        continue
      }

      // Filtrar por distancia geográfica
      const distance = this.calculateDistance(
        requestingPlayer.latitude,
        requestingPlayer.longitude,
        potentialMatch.latitude,
        potentialMatch.longitude,
      )

      if (distance <= this.maxDistanceKm) {
        // Filtrar por ranking similar
        const rankingDifference = Math.abs(requestingPlayer.ranking - potentialMatch.ranking)
        if (rankingDifference <= this.rankingDifferenceRange) {
          compatiblePlayers.push(potentialMatch)
        }
      }
    }

    // 3. Formar un juego si se encuentran jugadores compatibles
    if (compatiblePlayers.length > 0) {
      const matchedPlayer = compatiblePlayers[0]
      const newGameInput = {
        title: `Juego entre ${requestingPlayer.name} y ${matchedPlayer.name}`,
        description: "Matchmaking encontrado para jugadores con ranking similar y cercanos geográficamente.",
        players: {
          connect: [requestingPlayer.id, matchedPlayer.id].map((id) => ({
            id,
          })),
        },
      }

      const createdGame = await this.gameService.createGame(newGameInput)

      const players = [requestingPlayer.id, matchedPlayer.id].map((id) => ({ id }))
      const updatedGame = await this.gameService.updateGame(createdGame.id, {
        players: {
          connect: players,
        },
      })

      return updatedGame
    } else {
      // 4. Manejar "No Match"
      return {
        message: `No se encontraron jugadores compatibles para ${requestingPlayer.name} en este momento. Intenta de nuevo más tarde.`,
      }
    }
  }
}
