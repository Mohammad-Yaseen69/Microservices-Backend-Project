import multer from "multer"
import logger from "../utils/logger.js"
import ApiError from "../utils/apiError.js"

const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix)
    }
})

export const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        logger.error("Multer Error:", err);

        let message = "File upload failed";

        if (err.code === "LIMIT_FILE_SIZE") message = "File size too large (max 5MB)";
        if (err.code === "LIMIT_UNEXPECTED_FILE") message = "Unexpected file field";

        throw new ApiError(message, 400)
    }

    if (err) {
        logger.error("Upload Error:", err);
        throw new ApiError("File upload failed", 500, err)
    }

    next();
};




export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })