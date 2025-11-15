import { createPost, getAllPosts, deletePost, getPost, updatePost } from "../controllers/post.controller.js";
import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyUser)

router.post("/create-post", createPost)
router.get("/all-posts", getAllPosts)
router.get("/post/:id", getPost)
router.put("/update-post/:id", updatePost)
router.delete("/delete-post/:id", deletePost)

export default router