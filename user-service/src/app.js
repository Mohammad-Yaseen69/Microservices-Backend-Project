import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"


const app = express()

const allowedOrigins = [

];


app.use(express.json())
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(helmet())
app.use(cookieParser())


import userRoutes from "./routes/user.routes.js"

app.use("/api/users", cors(corsOptions), userRoutes)

export default app