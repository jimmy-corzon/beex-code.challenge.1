/**
 * Models: {@link Prisma.PlayerUncheckedCreateInput} {@link Prisma.PlayerUncheckedUpdateInput}
    name: string
    email?: string | null
    description?: string | null
    latitude?: number | null
    longitude?: number | null
*/

import { z } from "zod"

// Crear (jugador)
export const createPlayerSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).max(100),
      email: z.string().email().optional(),
      description: z.string().min(1).max(255).optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    })
    .strict(),
})

// Actualizar (jugador)
export const updatePlayerSchema = z.object({
  params: z
    .object({
      id: z.string().uuid("Id de jugador no válido"),
    })
    .strict(),
  body: z
    .object({
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
      description: z.string().min(1).max(255).optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    })
    .strict(),
})

// Obtener (jugador)
export const getPlayerSchema = z.object({
  params: z
    .object({
      id: z.string().uuid("Id de jugador no válido"),
    })
    .strict(),
})

// Listar (jugadores)
export const listPlayersSchema = z.object({
  query: z
    .object({
      _page: z.string().regex(/^d+$/).transform(Number).optional(),
      _per_page: z.string().regex(/^d+$/).transform(Number).optional(),
      _order: z.enum(["asc", "desc"]).optional(),
      _sort: z.enum(["name"]).optional(),
      // Filtros
      name: z.string().min(1).max(255).optional(),
      email: z.string().email().optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      not_email: z.string().email().nullable().optional(),
    })
    .strict(),
})

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>["body"]
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>["body"]
export type ListPlayersQuery = z.infer<typeof listPlayersSchema>["query"]
export type ListPlayersWhere = Omit<z.infer<typeof listPlayersSchema>["query"], "_page" | "_per_page" | "_order" | "_sort">
