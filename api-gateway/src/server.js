import dotenv from "dotenv"
import express from "express"
import logger from "./utils/logger.js"
import cors from "cors"
import helmet from "helmet"
import Redis from 'ioredis'
import { rateLimit } from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import proxy from "express-http-proxy"
import Hashids from "hashids"
import { verifyToken } from "./middleware/verifyToken.js"

dotenv.config()

const app = express()

export const redisClient = new Redis(process.env.REDIS_URL)

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

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
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

const rateLimitOptions = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Express rate limit exceed for IP: ${req.ip}`)
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}))
app.use(cors(corsOptions))
app.use(rateLimitOptions)

app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl} from IP: ${req.ip}`);
    next();
});

const proxyOptions = (service) => ({
    proxyReqPathResolver: (req) => {
        return req.originalUrl;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        return proxyResData;
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = srcReq.headers['content-type'] || 'application/json';
        return proxyReqOpts;
    },
    proxyErrorHandler: (err, res, next) => {
        const hashids = new Hashids(String(Date.now()), 8, "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
        const errorId = `ERR-${hashids.encode(1, 2, 3)}`;

        logger.error({
            message: `Proxy error: ${err.message}`,
            errorInformation: {
                stack: err.stack,
                code: err.code
            },
            errorId: errorId,
            requestUrl: res.req?.originalUrl,
            requestMethod: res.req?.method,
            requestHeaders: res.req?.headers,
            errorIn: service + "_service",
            services: {
                user: process.env.USER_SERVICE_URL,
                post: process.env.POST_SERVICE_URL
            }
        });

        if (!res.headersSent) {
            res.status(502).json({
                message: `We are unable to process your request at the moment. Event Id ${errorId}`,
                status: false
            });
        }
    },
})

app.use(express.json())

app.use("/api/users", verifyToken, proxy(process.env.USER_SERVICE_URL, proxyOptions("user")))
app.use("/api/posts", verifyToken, proxy(process.env.POST_SERVICE_URL, proxyOptions("post")))


app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`)
    console.log(`User Service URL: ${process.env.USER_SERVICE_URL}`)
    console.log(`POST Service URL: ${process.env.POST_SERVICE_URL}`)
    console.log(`Make sure user service is running!`)
})