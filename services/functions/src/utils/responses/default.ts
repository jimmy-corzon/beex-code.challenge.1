import { Response } from "express"
import { ApiResponse, ResCodes } from "."

// Manejar respuestas no autorizadas
/**
 * Maneja las respuestas no autorizadas
 * @param {Response} res - Instancia de Response
 * @return {Response}
 */
export async function handleUnauthorizedResponses(res: Response) {
  return ApiResponse.init(res).json(403, {
    code: ResCodes.FORBIDDEN,
    message: "No autorizado",
  })
}
