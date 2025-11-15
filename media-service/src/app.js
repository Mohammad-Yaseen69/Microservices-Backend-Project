import express from "express"
import helmet from "helmet"
import { rateLimit } from "express-rate-limit"
import logger from "./utils/logger.js"
import MediaRoutes from "./routes/media.routes.js"

const app = express()

app.use(express.json())
app.use(helmet())

const expressRoutesRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Express rate limit exceed for IP: ${req.ip}`)
        res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        })
    },
})

app.use(expressRoutesRateLimiter)
app.use("/api/media", MediaRoutes)

app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl} from IP: ${req.ip}`);
    next();
});


export default app