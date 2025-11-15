import { createPost } from "../controllers/post.controller.js";
import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyUser)
router.post("/create-post", createPost)

export default router