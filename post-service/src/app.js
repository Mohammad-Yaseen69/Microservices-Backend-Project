import express from "express"
import helmet from "helmet"
import { RateLimiterRedis } from 'rate-limiter-flexible'
import { rateLimit } from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import Redis from "ioredis"
import logger from "./utils/logger.js"
import PostRoutes from "./routes/post.routes.js"

const app = express()
export const redisClient = new Redis(process.env.REDIS_URL)

app.use(express.json())
app.use(helmet())

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    points: 10,
    duration: 3,
    blockDuration: 10
})

app.use(async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip)
        next()
    } catch {
        logger.warn(`Redis rate limit exceed for IP: ${req.ip}`)
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        })
    }
})

const expressRoutesRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
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
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})

app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl} from IP: ${req.ip}`);
    next();
});

app.use(expressRoutesRateLimiter)
app.use("/api/posts", PostRoutes)

export default app