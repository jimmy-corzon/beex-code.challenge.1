import { Response } from "express"
import { ResCodes } from "./codes"
import { logger } from "firebase-functions/v2"
import { ZodError } from "zod"
import { ResponseJson } from "./types"

/**
 * Clase encargada de manejar las respuestas de la aplicación
 */
export class ApiResponse {
  private response: Response

  /**
   * Constructor
   * @param {Response} res - Instancia de Response
   */
  constructor(res: Response) {
    this.response = res
  }

  /**
   * Método para inicializar la clase
   * @param {Response} res - Instancia de Response
   * @return {ApiResponse}
   */
  static init(res: Response) {
    return new ApiResponse(res)
  }

  /**
   * Método para enviar una respuesta en formato json
   * @param {number} statusCode - Código de estado HTTP
   * @param {ResponseJson} data - Datos a enviar
   * @return {Response}
   */
  json(statusCode: number, data: ResponseJson) {
    return this.response.status(statusCode).json(data)
  }

  /**
   * Método para enviar una respuesta en formato pdf
   * @param {Buffer} pdfBuffer - Buffer de pdf
   * @return {Response}
   */
  pdf(pdfBuffer: Buffer) {
    this.response.setHeader("Content-Type", "application/pdf")
    return this.response.status(200).send(pdfBuffer)
  }

  /**
   * Método para enviar una respuesta en formato csv
   * @param {string} csvData - Datos en formato csv
   * @return {Response}
   */
  csv(csvData: string) {
    this.response.setHeader("Content-Type", "text/csv")
    return this.response.status(200).send(csvData)
  }

  /**
   * Método para manejar errores
   * @param {unknown} err - Error a manejar
   * @param {string} message - Mensaje de error
   * @return {Response}
   */
  handleError(err: unknown, message?: string) {
    logger.error((err as Error).message)

    // Zod
    if (err instanceof ZodError) {
      return this.json(400, {
        code: ResCodes.INVALID_DATA,
        message: "Error de validación de datos",
        error: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      })
    }

    return this.json(500, {
      code: ResCodes.INTERNAL_SERVER_ERROR,
      error: (err as Error).message,
      message: message ? `Ocurrió un error interno del servidor: ${message}` : "Ocurrió un error interno del servidor",
    })
  }
}

export { ResCodes }
