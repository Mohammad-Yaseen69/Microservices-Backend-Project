import { v2 as cloudinary } from 'cloudinary'
import logger from './logger.js'
import fs from "node:fs"

const initCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    })
}


const uploadFile = (file) => {
    initCloudinary()

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: "auto",
        }, (error, result) => {
            if (error) {
                logger.error("Error while uploading file", error)
                if (file.path) fs.unlink(file.path, err => {
                    if (err) logger.error("Error deleting temp file:", err)
                })
                reject(error)
            } else {
                if (file.path) fs.unlink(file.path, err => {
                    if (err) logger.error("Error deleting temp file:", err)
                })
                resolve(result)
            }
        })

        uploadStream.end(file.buffer)
    })
}

export { uploadFile }