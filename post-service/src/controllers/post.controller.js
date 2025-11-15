import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { postCreationValidation } from "../utils/validators.js";
import { Post } from "../models/post.model.js";
import ApiResponse from "../utils/apiResponse.js";


export const createPost = asyncHandler(async (req, res) => {
    const { title, content, tags = [] } = req.body || {};

    const { message, errors } = postCreationValidation(req.body || {})

    if (message) {
        throw new ApiError(message, 400, errors)
    }

    const post = await Post.create({
        title,
        content,
        tags,
        user: req.user.userId
    });


    if (!post) {
        throw new ApiError("Failed to create post", 500)
    }


    return res.status(201).json(
       new ApiResponse(201, "Post Creation Successfull", post)
    )
})