import mongoose from "mongoose";
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async(req, res) => {
    // check video ID
    // get video details from frontend
    // toggle like || unlike
    // return res
    const {videoId} = req.params
    console.log("hello vikash")

    const userId=req.user?.id

    if(!videoId) {
        throw new ApiError(400, "Video id required")
    }

    const likeVideo=await Video.findOne({
        video:videoId,
        user:userId
    })

    if(likeVideo) {
        await Like.deleteOne({video:videoId, user:userId })
        return res
        .status(200)
        .json(new ApiResponse(200, "video unliked successful"))
    } else {
        await Like.create({video:videoId, user:userId })
        return res
        .status(200)
        .json(new ApiResponse(200, "video liked successful"))
    
    }

})

const toggleCommentLike = asyncHandler(async(req, res) => {
    // check comment ID
    // get comment details from frontend
    // toggle like || unlike
    // return res
    const {commentId} = req.params
    const userId=req.user?.id

    if(!commentId) {
        throw new ApiError(400, "Comment id required")
    }

    const likeComment=await Like.findOne({
        comment:commentId,
        user:userId
    })

    if(likeComment) {
        await Like.deleteOne({comment:commentId, user:userId })
        return res
        .status(200)
        .json(new ApiResponse(200, "comment unliked successful"))
    } else {
        await Like.create({comment:commentId, user:userId })
        return res
        .status(200)
        .json(new ApiResponse(200, "comment liked successful"))
    
    }

})

const toggleTweetLike = asyncHandler(async(req, res) => {
    // check tweet ID
    // get tweet details from frontend
    // toggle like || unlike
    // return res
    const {tweetId} = req.params
    const likeId=req.like?.id

    if(!tweetId) {
        throw new ApiError(400, "Comment id required")
    }

    const likeTweet=await Like.findOne({
        tweet:tweetId,
        like:likeId
    })

    if(likeTweet) {
        await Like.deleteOne({tweet:tweetId, like:likeId })
        return res
        .status(200)
        .json(new ApiResponse(200, "tweet unliked successful"))
    } else {
        await Like.create({tweet:tweetId})
        return res
        .status(200)
        .json(new ApiResponse(200, "tweet liked successful"))
    }

})

const toggleLikedVideos = asyncHandler(async(req, res) => {
   
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    toggleLikedVideos
}