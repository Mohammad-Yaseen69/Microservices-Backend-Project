

import app from "./app.js"
import { connectDb } from "./db/index.js"



const PORT = process.env.PORT || 3001

const startServer = async () => {
    await connectDb()
    app.listen(PORT, () => {
        console.log(`Post service running on port ${PORT}`)
    })
}


startServer()