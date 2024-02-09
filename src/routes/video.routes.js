import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"

import {upload} from '../middlewares/multer.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';


const router = Router();
router.use(verifyToken); // Apply verifyToken middleware to all routes in this file

router.get("/", getAllVideos);
router.post("/upload", upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]), publishAVideo);
router.get("/:videoId", getVideoById);
router.delete("/:videoId", deleteVideo);
router.patch("/:videoId", upload.single("thumbnail"), updateVideo);
router.patch("/toggle/publish/:videoId", togglePublishStatus);

export default router