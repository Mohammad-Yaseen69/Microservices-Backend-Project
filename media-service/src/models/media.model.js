import mongoose from "mongoose"

const MediaModel = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })


export const Media = mongoose.model("Media", MediaModel)