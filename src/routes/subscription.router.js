import { Router } from "express";

import { 
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleScription

 } from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();
router.use(verifyJWT)

router.route("/:channelId").post(toggleScription)
router.route("/user/:channelId").get(getUserChannelSubscribers)
router.route("/:subscriberId").get(getSubscribedChannels)

export default router
