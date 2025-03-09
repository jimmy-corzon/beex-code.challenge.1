import express from "express"
import * as bodyParser from "body-parser"
import morgan from "morgan"

import { appRouter } from "./app"

const app = express()

app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }))
app.use(morgan("dev"))

app.use("/api/v1", appRouter)

export default app
