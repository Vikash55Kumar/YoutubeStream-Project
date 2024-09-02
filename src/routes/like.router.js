import { Router } from "express";

import {
    toggleCommentLike,
    toggleLikedVideos,
    toggleTweetLike
 } from "../controllers/like.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

// router.route("/comment/:commentId").post(toggleCommentLike)

router.route("/tweet/:tweetId").get(toggleTweetLike)

router.route("/video/:videoId").get(toggleLikedVideos)

export default router