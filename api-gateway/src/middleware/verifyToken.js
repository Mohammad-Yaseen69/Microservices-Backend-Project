import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";


const publicRoutes = [
    "/login",
    "/register",
    "/refresh"
]
export const verifyToken = asyncHandler(async (req, res, next) => {
    console.log(req.path)
    if (publicRoutes.includes(req.path)) {
        return next()
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError("Unauthorized - No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.headers['x-user-id'] = user.id;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError("Unauthorized", 401);
        }
        throw new ApiError("Invalid token", 401);
    }
});
