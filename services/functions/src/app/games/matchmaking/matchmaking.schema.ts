import { z } from "zod"

// Schema para la solicitud de Matchmaking
export const requestMatchmakingSchema = z.object({
  body: z
    .object({
      player_id: z.string().uuid("Id de jugador no válido"),
    })
    .strict(),
})

export type RequestMatchmakingInput = z.infer<typeof requestMatchmakingSchema>["body"]
