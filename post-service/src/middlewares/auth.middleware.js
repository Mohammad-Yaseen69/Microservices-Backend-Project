import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js"

export const verifyUser = asyncHandler(async (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    req.user = { userId }
    next()
}) 