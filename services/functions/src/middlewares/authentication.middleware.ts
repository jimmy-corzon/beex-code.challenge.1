import type { Request, Response, NextFunction } from "express"
import { ApiResponse } from "../utils/responses"
import { FirebaseService } from "../services/firebase"
import { CustomClaims } from "../types"
import { handleUnauthorizedResponses } from "../utils/responses/default"

/**
 * Verifica si el usuario tiene las custom claims necesarias
 * Requiere que el usuario tenga un ID de base de datos, ID de rol y nombre de rol
 *
 * @param {Request} req - Objeto de solicitud Express que debe contener datos del usuario
 * @param {Response} res - Objeto de respuesta Express
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * @return {void}
 */
function checkRequiredUserClaims(req: Request, res: Response, next: NextFunction) {
  if (req.user?.claims.user_id_database) {
    return next()
  } else {
    return handleUnauthorizedResponses(res)
  }
}

/**
 * Maneja la autenticación de Firebase (Cliente)
 * Verifica el token JWT y obtiene la información del usuario
 *
 * @param {string} token - Token JWT de Firebase
 * @return {Function} Middleware de Express
 */
function handleFirebaseAuthCLient(token: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const firebaseService = new FirebaseService()

      const decodeToken = await firebaseService.auth.verifyUserTokenId(token)

      const { uid } = decodeToken
      const userRecord = await firebaseService.auth.getUserByUid(uid)

      if (!userRecord || !uid) {
        return handleUnauthorizedResponses(res)
      }

      req.user = {
        user: userRecord,
        claims: decodeToken as unknown as CustomClaims,
      }

      return checkRequiredUserClaims(req, res, next)
    } catch (error) {
      return ApiResponse.init(res).handleError(error, "No se logro verificar el token")
    }
  }
}

/**
 * Middleware principal de autenticación
 * Determina el tipo de autenticación (cliente o servidor) basado en los headers
 *
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * @return {void}
 */
export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.replace("Bearer ", "")
  if (token) {
    return handleFirebaseAuthCLient(token)(req, res, next)
  }

  return handleUnauthorizedResponses(res)
}
