import { Media } from "../models/media.model.js"
import ApiError from "../utils/apiError.js"
import ApiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadFile } from "../utils/cloudinary.js"
import logger from "../utils/logger.js"

export const uploadMedia = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError("File is Required", 400)
    }

    const { originalname, mimetype } = req.file

    console.log("Starting media upload")

    uploadFile(req.file).then(async (result) => {
        logger.info(`File uploaded successfully: ${originalname} (${mimetype}) to Cloudinary with ID: ${result.public_id}`)

        const createdMedia = await Media.create({
            mimeType: mimetype,
            originalName: originalname,
            url: result.secure_url,
            public_id: result.public_id,
            user: req.user?.userId
        })

        if (!createdMedia) {
            throw new ApiError("Unable to save media info to database", 500)
        }

        return res.status(201).json(
            new ApiResponse(201, "Media Created Successfully", createdMedia)
        )

    }).catch((err) => {
        console.log("media upload failed")
        logger.error("Media upload failed error: ", err)
        return res.status(500).json({
            status: false,
            message: "Media upload Failed"
        })
    })
})


