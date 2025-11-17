import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { postCreationValidation, postUpdateValidation } from "../utils/validators.js";
import { Post } from "../models/post.model.js";
import ApiResponse from "../utils/apiResponse.js";
import { redisClient } from "../app.js";

const invalidateCache = async (input) => {
    const keys = await redisClient.keys("posts:*")

    if (input) {
        keys.push(`post:${input}`)
    }

    if (keys && keys?.length > 0) {
        await redisClient?.del(keys)
    }
}

export const createPost = asyncHandler(async (req, res) => {
    const { title, content, tags = [], mediaIds } = req.body || {};

    const { message, errors } = postCreationValidation(req.body || {})

    if (message) {
        throw new ApiError(message, 400, errors)
    }

    const post = await Post.create({
        title,
        content,
        tags,
        user: req.user.userId,
        mediaIds: mediaIds || []
    });

    await invalidateCache(post?._id)


    if (!post) {
        throw new ApiError("Failed to create post", 500)
    }


    return res.status(201).json(
        new ApiResponse(201, "Post Creation Successfull", post)
    )
})

export const getAllPosts = asyncHandler(async (req, res) => {
    const page = req.query.page || 1
    const limit = req.query.limit || 10
    const skip = (page - 1) * limit

    const key = `posts:${page}:${limit}`
    const cachedPosts = await redisClient.get(key)


    if (cachedPosts) {
        return res.status(200).json(
            new ApiResponse(200, "Posts fetched successfully (from cache)", JSON.parse(cachedPosts))
        )
    }

    const posts = await Post.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit)
    const totalPosts = await Post.countDocuments()

    const result = {
        posts: posts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts: totalPosts
    }

    await redisClient.setex(key, 500, JSON.stringify(result))
    return res.status(200).json(
        new ApiResponse(200, "Posts fetched successfully", result)
    )
})

export const getPost = asyncHandler(async (req, res) => {
    const postId = req.params.id

    if (!postId) {
        throw new ApiError("Post ID is required", 400)
    }

    const cacheKey = `post:${postId}`
    const cachedPost = await redisClient.get(cacheKey)

    if (cachedPost) {
        return res.status(200).json(
            new ApiResponse(200, "Post fetched successfully (from cache)", JSON.parse(cachedPost))
        )
    }

    const post = await Post.findById(postId)

    if (!post) {
        throw new ApiError("Post not found", 404)
    }

    await redisClient.setex(cacheKey, 3600, JSON.stringify(post))

    return res.status(200).json(
        new ApiResponse(200, "Post fetched successfully", post)
    )
})

export const deletePost = asyncHandler(async (req, res) => {
    const postId = req.params.id

    if (!postId) {
        throw new ApiError("Post ID is required", 400)
    }

    const post = await Post.findById(postId)

    if (!post) {
        throw new ApiError("Post not found", 404)
    }

    if (post.user.toString() !== req.user.userId) {
        throw new ApiError("Unauthorized to delete this post", 403)
    }

    await Post.findByIdAndDelete(postId)
    await invalidateCache(postId)

    return res.status(200).json(
        new ApiResponse(200, "Post deleted successfully")
    )
})


export const updatePost = asyncHandler(async (req, res) => {
    const postId = req.params.id
    const { title, content, tags } = req.body || {};

    if (!postId) {
        throw new ApiError("Post ID is required", 400)
    }

    const { message, errors } = postUpdateValidation(req.body)


    if (message) {
        throw new ApiError(message, 400, errors)
    }

    const post = await Post.findById(postId)

    if (!post) {
        throw new ApiError("Post not found", 404)
    }

    if (post.user.toString() !== req.user.userId) {
        throw new ApiError("Unauthorized to update this post", 403)
    }

    post.title = title || post.title
    post.content = content || post.content
    post.tags = tags || post.tags

    await post.save()
    await invalidateCache(postId)

    return res.status(200).json(
        new ApiResponse(200, "Post updated successfully", post)
    )
})
