import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js"


export const authenticationMiddleware = asyncHandler(async (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if (!userId) { 
        throw new ApiError("Unauthorized", 401);
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    req.user = user
    next()
});
