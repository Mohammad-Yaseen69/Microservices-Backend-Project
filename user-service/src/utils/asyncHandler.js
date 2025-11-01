import Hashids from "hashids"
import logger from "./logger.js";
import ApiError from "./apiError.js";

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        let message;

        const hashids = new Hashids(String(Date.now()), 8, "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
        const errorId = `ERR-${hashids.encode(1, 2, 3)}`;

        if (error instanceof ApiError) {
            logger.error({
                message: error.message,
                errorId: errorId,
                apiInformation: {
                    endpoint: req.originalUrl,
                    method: req.method,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                }
            })

            message = `${error.message} Event Id: ${errorId}`
        } else {
            logger.error({
                message: error.message || "Internal Server Error",
                errorId: errorId,
                apiInformation: {
                    endpoint: req.originalUrl,
                    method: req.method,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                },
                errorInformation: {
                    stack: error.stack,
                    ...error
                }
            })

            message = `Unable to process this request Evend Id: ${errorId}`
        }



        return res.status(error.isApiError ? error.statusCode : 500).json({
            success: false,
            message: message,
        })
    }
}


export default asyncHandler