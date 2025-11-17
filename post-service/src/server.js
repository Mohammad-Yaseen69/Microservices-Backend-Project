import dotenv from "dotenv"
dotenv.config()

import app from "./app.js" 
import { connectDb } from "./db/index.js"
import { connectRabbitMQ } from "./utils/rabbitMq.js"



const PORT = process.env.PORT || 3002

const startServer = async () => {
    await connectDb()
    await connectRabbitMQ()
    app.listen(PORT, () => {
        console.log(`Post service running on port ${PORT}`)
    })
}


startServer()