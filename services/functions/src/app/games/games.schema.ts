/**  Models: {@link Prisma.GameUncheckedCreateInput} {@link Prisma.GameUncheckedUpdateInput}
    title: string
    description?: string | null
    status?: $Enums.GameStatus
    winner_ids?: GameCreatewinner_idsInput | string[]
    players?: PlayerUncheckedCreateNestedManyWithoutGamesInput
*/

import { z } from "zod"

// Crear (juego)
export const createGameSchema = z.object({
  body: z
    .object({
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(255).optional(),
      player_ids: z.array(z.string().uuid("Id de jugador no válido")).min(1).max(2),
    })
    .strict(),
})

// Actualizar (juego)
export const updateGameSchema = z.object({
  params: z
    .object({
      id: z.string().uuid("Id de juego no válido"),
    })
    .strict(),
  body: z
    .object({
      description: z.string().min(1).max(255).optional(),
      add_player_ids: z.array(z.string().uuid("Id de jugador no válido")).min(1).max(2).optional(),
    })
    .strict(),
})

// Obtener (juego)
export const getGameSchema = z.object({
  params: z
    .object({
      id: z.string().uuid("Id de juego no válido"),
    })
    .strict(),
})

// Listar (juegos)
export const listGamesSchema = z.object({
  query: z
    .object({
      _page: z.string().regex(/^d+$/).transform(Number).optional(),
      _per_page: z.string().regex(/^d+$/).transform(Number).optional(),
      _order: z.enum(["asc", "desc"]).optional(),
      _sort: z.enum(["title"]).optional(),
      // Filtros
      title: z.string().min(1).max(100).optional(),
      status: z.enum(["open", "waiting", "closed"]).optional(),
    })
    .strict(),
})

// Reportar resultado del juego
export const reportGameResultSchema = z.object({
  params: z
    .object({
      id: z.string().uuid("Id de juego no válido"),
    })
    .strict(),
  body: z
    .object({
      winner_ids: z.array(z.string().uuid("Id de jugador no válido")).min(1).max(2),
    })
    .strict(),
})

export type CreateGameInput = z.infer<typeof createGameSchema>["body"]
export type UpdateGameInput = z.infer<typeof updateGameSchema>["body"]
export type ListGamesQuery = z.infer<typeof listGamesSchema>["query"]
export type ListGamesWhere = Omit<z.infer<typeof listGamesSchema>["query"], "_page" | "_per_page" | "_order" | "_sort">
export type ReportGameResultInput = z.infer<typeof reportGameResultSchema>["body"] // Exportado el tipo para ReportGameResultInput
