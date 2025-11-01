import { cookiesSettings } from "../constant.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateLogin, validateRegistration } from "../utils/validators.js";
import jwt from "jsonwebtoken"


export const registerUser = asyncHandler(async (req, res) => {
    const { email, password, username, about, name } = req.body

    const { error } = validateRegistration(req.body)

    if (error) {
        throw new ApiError(error.details[0].message, 400, error.details.map((err) => err.message))
    }


    const userExistCheck = await User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    })

    if (userExistCheck) {
        if (userExistCheck.some(user => user.email === email)) {
            throw new ApiError("Email already in use", 400)
        }

        if (userExistCheck.some(user => user.username === username)) {
            throw new ApiError("Username already in use", 400)
        }
    }


    const user = await User.create({
        email,
        username,
        password,
        about,
        name
    })


    if (!user) {
        throw new ApiError("Failed to create user", 500)
    }

    return res.status(200).json(
        new ApiResponse(201, "User Created Succesfully", user)
    )
})


export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const { error } = validateLogin(req.body)
    if (error) {
        throw new ApiError(error.details[0].message, 400, error.details.map((err) => err.message))
    }

    const user = await User.findOne({ email: email }).select("-password")

    if (!user) {
        throw new ApiError("Invalid credentials", 404)
    }

    const comparePassword = await user.comparePassword(password)

    if (!comparePassword) {
        throw new ApiError("Invalid credentials", 404)
    }

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    res.cookie("refreshToken", refreshToken, cookiesSettings)

    return res.status(200).json(
        new ApiResponse(200, "Login successful", {
            accessToken,
            user: user,
        })
    )
})


export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", secure: true });
    return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        throw new ApiError("Refresh token not found", 401)
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new ApiError("Refresh token expired", 401);
        } else if (err.name === "JsonWebTokenError") {
            throw new ApiError("Invalid refresh token", 401);
        } else {
            throw new ApiError("Token verification failed", 401);
        }
    }

    if (!decoded) {
        throw new ApiError("Invalid Token", 401)
    }

    const user = await User.findById(decoded.id)

    if (!user) {
        throw new ApiError("User not found", 404)
    }


    const newAccessToken = await user.generateAccessToken()

    return res.status(200).json(
        new ApiResponse(200, "Access token refreshed", {
            accessToken: newAccessToken
        })
    )
})


export const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.params.userId

    const user = await User.findById(userId).select("-password")

    if (!user) {
        throw new ApiError("User not found", 404)
    }

    return res.status(200).json(
        new ApiResponse(200, "User profile fetched successfully", user)
    )
})



export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password")

    return res.status(200).json(
        new ApiResponse(200, "Users fetched successfully", users)
    )
})


export const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.userId

    const user = await User.findOneAndDelete({ _id: userId })

    if (!user) {
        throw new ApiError("User not found", 404)
    }

    return res.status(200).json(
        new ApiResponse(200, "User Deleted Succesfully")
    )
})


