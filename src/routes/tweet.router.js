import { Router } from "express";

import { 
     createTweet,
     deleteTweet,
     getUserTweets,
     updateTweet
    } from "../controllers/twtter.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/get").post(createTweet)

router.route("/user/:userId").get(getUserTweets)

router.route("/updateTweet/:id").put(updateTweet)

router.route("/deleteTweet/:id").put(deleteTweet)

export default router;