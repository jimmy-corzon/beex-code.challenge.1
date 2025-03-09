import { PrismaClient } from "@prisma/client"
import { UserRecord } from "firebase-admin/auth"

// Extiende la interfaz Request para incluir la propiedad user
declare module "express-serve-static-core" {
  interface Request {
    user?: UserApplication
  }
}

// Entorno de ejecución
export type Environment = "development" | "production" | "test"

// Reclamaciones personalizadas
export interface CustomClaims {
  user_id_database?: string | null
}

// Usuario de la aplicación
export interface UserApplication {
  user: UserRecord
  claims: CustomClaims
}

// Metadatos de la aplicación
export type MetaInputApp = {
  current_user: UserApplication
}

// Declaración global de la variable prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}
