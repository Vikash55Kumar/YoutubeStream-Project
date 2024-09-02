import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { 
  deleteVideo,
  getVideoById,
    publishVideo,
    togglePublishStatus,
    uploadVideo,
  } from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
const router =Router()

router.use(verifyJWT)

router.route("/publish").post(
  upload.fields([
    {
        name: "thumbnail",
        maxCount: 1
    }, 
    {
        name: "videoFile",
        maxCount: 1
    }
  ]), publishVideo);

router.route("/getVideo/:videoId").get(getVideoById)

router.route("/updateVideo/:videoId").post(upload.single("thumbnail"), uploadVideo)

router.route("/deleteVideo/:videoId").post(deleteVideo)

router.route("/isPublished/:videoId").patch(togglePublishStatus)
export default router;


