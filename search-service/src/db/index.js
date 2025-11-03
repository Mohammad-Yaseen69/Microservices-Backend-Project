import mongoose from "mongoose"

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        console.error("Failed to connect to MongoDB", error)
        process.exit(1)
    }
}