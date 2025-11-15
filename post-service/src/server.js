import dotenv from "dotenv"
import app from "./app.js"
import { connectDb } from "./db/index.js"


dotenv.config()

const PORT = process.env.PORT || 3002

const startServer = async () => {
    await connectDb()
    app.listen(PORT, () => {
        console.log(`Post service running on port ${PORT}`)
    })
}


startServer()