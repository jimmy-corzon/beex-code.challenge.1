import { APP_ENVIRONMENT } from "../../config/env"
import { PrismaClient } from "@prisma/client"
import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import ws from "ws"

const db_client = (connectionString: string) => {
  neonConfig.webSocketConstructor = ws
  neonConfig.poolQueryViaFetch = true

  const pool = new Pool({ connectionString: `${connectionString}` })
  const adapter = new PrismaNeon(pool)
  const prisma = global.prisma || new PrismaClient({ adapter })

  if (APP_ENVIRONMENT === "development") global.prisma = prisma

  return prisma
}

export { db_client }
