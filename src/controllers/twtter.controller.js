import {Tweet} from "../models/tweet.model.js";
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async(req, res) => {
    const {content} =req.body
    const userId=req.user?.id
    
    if(!content) {
        throw new ApiError(400, "content are required")
    }

    const user=await Tweet.create({
        content:content,
        owner:userId
    })

    if(!user) {
        throw new ApiError(400, "Something went wronge to create tweet")
    }

    return res.status(201).json(
        new ApiResponse(200, user, "tweet created successfully")
    )
})

const getUserTweets=asyncHandler(async(req, res) => {
    // check Tweet Id
    // fetch data from server
    // show data message

    const {userId}=req.params

    if(!userId) {
        throw new ApiError(400, "Tweet ID required")
    }

    const tweerUser = await Tweet.find({owner:userId}).populate("owner", "content")

    if (!tweerUser || tweerUser.length===0) {
        return res
            .status(404)
            .json(new ApiResponse(404, [], "No tweet found "));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweerUser, "Tweet fetched successfully"));

})

const updateTweet = asyncHandler(async (req, res) => {
    // request for new tweet content
    // check tweet Id
    // response tweet

    const { content } = req.body;
    const tweetId = req.params?.id;

    const tweet = await Tweet.findOne({_id: tweetId });

    if (!tweet) {
        throw new ApiError(400, "Tweet not found to update this tweet");
    }

    tweet.content = content;
    await tweet.save();

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
});

const deleteTweet=asyncHandler(async(req, res) => {
    // check tweet id
    // find tweet 
    // response tweet
    const tweetId=req.params?.id;

    const delete_Tweet=await Tweet.findByIdAndDelete({_id:tweetId})

    if(!delete_Tweet) {
        throw new ApiError(400, "Tweet not deleted");
    }

    return res.status(200).json(
        new ApiResponse(200, "Tweet delete successfully")
    );

})

// const deleteVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params;

//     if (!videoId) {
//         throw new ApiError(400, "Video ID is required");
//     }

//     // Fetch the video record
//     const video = await Video.findById(videoId);
//     if (!video) {
//         throw new ApiError(404, "Video not found");
//     }

//     const thumbnailUrl = video.thumbnail;
//     // Use actual video URL for testing
//     const videoUrl = 'http://res.cloudinary.com/dmm3jevkq/video/upload/v1723968644/c0vfqtihqku0xd1lx5ov.mp4';

//     console.log("Video URL:", videoUrl);

//     // Extract public IDs using regex
//     const thumbnailPublicIdMatch = thumbnailUrl.match(/\/v\d+\/([^\/]+)\.[a-z]{3,4}$/i);
//     const videoPublicIdMatch = videoUrl.match(/\/video\/upload\/v\d+\/([^\/]+)\.[a-z0-9]+$/i);


//     console.log("Thumbnail Public ID Match:", thumbnailPublicIdMatch);
//     console.log("Video Public ID Match:", videoPublicIdMatch);

//     if (!thumbnailPublicIdMatch) {
//         throw new ApiError(400, "Invalid thumbnail URL format");
//     }

//     if (!videoPublicIdMatch) {
//         throw new ApiError(400, "Invalid video URL format");
//     }

//     const thumbnailPublicId = thumbnailPublicIdMatch[1];
//     const videoPublicId = videoPublicIdMatch[1];

//     // Delete thumbnail from Cloudinary
//     const thumbnailDeletionResult = await deleteFromCloudinary(thumbnailPublicId);
//     if (!thumbnailDeletionResult) {
//         throw new ApiError(500, "Error deleting old thumbnail");
//     }

//     // Delete video from Cloudinary
//     const videoDeletionResult = await deleteFromCloudinary(videoPublicId);
//     if (!videoDeletionResult) {
//         throw new ApiError(500, "Error deleting old video file");
//     }

//     // Delete the video record from the database
//     const deletedVideo = await Video.findByIdAndDelete(videoId);
//     if (!deletedVideo) {
//         throw new ApiError(400, "Error deleting video record");
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
// });

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}