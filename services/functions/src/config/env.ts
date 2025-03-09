import dotenv from "dotenv"
import { Environment } from "../types"

dotenv.config()

const APP_ENVIRONMENT = process.env.NODE_ENV! as Environment
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS!)
const DATABASE_URL = process.env.DATABASE_URL!
const DIRECT_URL = process.env.DIRECT_URL!

export { APP_ENVIRONMENT, SALT_ROUNDS, DATABASE_URL, DIRECT_URL }
