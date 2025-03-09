import { type NextFunction, type Request, type Response } from "express"
import { type AnyZodObject } from "zod"
import { ApiResponse } from "../utils/responses"

// Middleware de validación de esquemas
export const schemaValidator = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
    })
    return next()
  } catch (err) {
    return ApiResponse.init(res).handleError(err)
  }
}
