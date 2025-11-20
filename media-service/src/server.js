import dotenv from "dotenv"
dotenv.config()

import app from "./app.js"
import { connectDb } from "./db/index.js"
import { connectRabbitMQ, consumeEvent } from "./utils/rabbitMq.js"
import { deleteMediaHandler } from "./events/deleteMedia.js"

const PORT = process.env.PORT || 3004

const startServer = async () => {
    await connectDb()
    await connectRabbitMQ()
    await consumeEvent("post.deleted", deleteMediaHandler)
    app.listen(PORT, () => {
        console.log(`Post service running on port ${PORT}`)
    })
}


startServer()