import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
        tags: [String],
        mediaIds: [String]
    },
    { timestamps: true }
)

export const Post = mongoose.model("Post", postSchema)