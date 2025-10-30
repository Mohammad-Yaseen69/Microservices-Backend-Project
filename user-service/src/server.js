import cors from "cors"
import dotenv from "dotenv"
import app from "./app.js"
import express from "express"
import { connectDb } from "./db/index.js"

dotenv.config()

app.use(express.json())
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
}))

const PORT = process.env.PORT || 3001

const startServer = async () => {
    await connectDb()
    app.listen(PORT, () => {
        console.log(`User service running on port ${PORT}`)
    })
}


startServer()