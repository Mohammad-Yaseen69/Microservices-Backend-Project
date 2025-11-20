import { Media } from "../models/media.model.js";
import { deleteFile } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";

export const deleteMediaHandler = async (event) => {
    try {
        console.log("Event received", event)
        if (event?.mediaIds?.length === 0) {
            return;
        }

        const medias = await Media.find({ _id: { $in: event?.mediaIds }, user: event.user })

        if (medias?.length > 0) {
            for (const media of medias) {
                await deleteFile(media.public_id)
                await media.deleteOne()
            }
        }

        logger.info("Media deleted successfully")
    } catch (error) {
        logger.error("Something went wrong while deleting medias error:", error)
    }
}