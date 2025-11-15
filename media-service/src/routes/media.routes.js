import { Router } from "express"
import { upload, multerErrorHandler } from "../middlewares/multer.middleware.js"
import { verifyUser } from "../middlewares/auth.middleware.js"
import { uploadMedia } from "../controllers/media.controller.js"


const router = Router()

router.route("/upload-media").post(
    verifyUser,
    upload.single("file"),
    multerErrorHandler,
    uploadMedia
)

export default router