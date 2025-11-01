import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import argon2 from "argon2"

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: false,
    }
}, { timestamps: true })


userModel.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }
    this.password = await argon2.hash(this.password)
    next()
})

userModel.methods.comparePassword = async function (candidatePassword) {
    return argon2.verify(this.password, candidatePassword)
}

userModel.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30m",
        }
    )
}

userModel.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    )
}


export const User = mongoose.model("User", userModel)