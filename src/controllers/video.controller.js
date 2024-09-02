import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import ffmpeg from "fluent-ffmpeg";

const getAllVideos = asyncHandler(async(req, res) => {

})

const publishVideo = asyncHandler(async(req, res) => {
    // check all fields
    // input video thumbnail from frontend
    // check video || thumbnail path
    // upload on cloudinary
    // extract duration from video
    // save all fiels to server
    // show response message
    const {title, description} = req.body

    const userId = req.user?.id

    if(!title || !description) {
        throw new ApiError(400, "All field require")
    }

    const thumbnailPath = req.files?.thumbnail[0]?.path;
 
    let localVideoFile;
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        localVideoFile = req.files.videoFile[0].path
    }
    if(!thumbnailPath) {
        throw new ApiError(400, "Thumbnail Image are required")
    }

    if(!localVideoFile) {
        throw new ApiError(400, "videoFile are required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    const video = await uploadOnCloudinary(localVideoFile)

    if(!thumbnail) {
        throw new ApiError(400, "Error to uploading thumbnail")
    }

    if(!video) {
        throw new ApiError(400, "Error to uploading video")
    }

    let duration;
    try {
        duration = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(localVideoFile, (err, metadata) => {
                if (err) {
                    reject(new ApiError(500, "Error extracting video duration"));
                }
                resolve(metadata.format.duration);
            });
        });
    } catch (error) {
        throw error;
    }

    const uploadVideo = new Video({
        title,
        description,
        videoFile: video.url,
        thumbnail: thumbnail?.url,
        duration: duration,
        owner: userId,
    });

    try {
        const savedVideo = await uploadVideo.save();
        return res.status(200).json(new ApiResponse(200, savedVideo, "Video registered successfully"));
    } catch (error) {
        throw new ApiError(400, "Something went wrong uploading the video");
    }
});

const getVideoById = asyncHandler(async(req, res) => {
    const {videoId} = req.params

    if(!videoId) {
        throw new ApiError(400, "VideoId required")
    }

    // video are schema not in the schema
    // const videoDetail = await Video.find(video:videoId).populate("video", S"title description duration thumbnail")
    const videoDetail = await Video.findById(videoId).populate("title description duration thumbnail")

    if (!videoDetail) {
        return res
            .status(404)
            .json(new ApiResponse(404, [], "No Video found "));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoDetail, "Video Details fetched successfully"));

})

const uploadVideo = asyncHandler(async (req, res) => {
    // extract current details title, description, thumbnail
    // validate title || description || thumbnail
    // extract video Id ------- very important
    // extract thumbnail url
    // delet old and add new thumnail
    // save title, description, thumbnail
    // response message

    const {title, description} = req.body

    if(!title || !description) {
        throw new ApiError(400, "tilel or description are require")
    }

    const thumbnailPath = req.file?.path

    if(!thumbnailPath) {
        throw new ApiError(400, "thumbnail are require")
    }

    const {videoId} = req.params;
    
    const user = await Video.findById(videoId); // Correctly access the video by ID
    
    if (!user) {
        throw new ApiError(404, "thumbnail not found");
    }

    const thumbnailUrl = user.thumbnail;

    // Extract publicId from URL
    const thumbnailPublicIdMatch = thumbnailUrl.match(/\/v\d+\/([^\/]+)\.[a-z]{3,4}$/i);
    if (!thumbnailPublicIdMatch) {
        throw new ApiError(400, "Invalid thumbnail URL format");
    }

    const publicId = thumbnailPublicIdMatch[1];

    const deletionSuccessful = await deleteFromCloudinary(publicId);

    if (!deletionSuccessful) {
        throw new ApiError(500, "Error deleting old thumbnail");
    }

    const thumbnail=await uploadOnCloudinary(thumbnailPath)

    if(!thumbnail.url) {
        throw new ApiError(400, "error while uploading thumbnail")
    }

    const videoDetailsUpdate= await Video.findByIdAndUpdate(user?._id, {
        $set: {
            title:title,
            description:description,
            thumbnail:thumbnail.url
        }
    }, {new:true}
    )

    if(!videoDetailsUpdate) {
        throw new ApiError(400, "error while uploading videoDetailsUpdate")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, videoDetailsUpdate, "videoDetailsUpdate update successfull"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const thumbnailUrl = video.thumbnail;

    const videoUrl = video.videoFile

    // Extract public IDs using regex
    const thumbnailPublicIdMatch = thumbnailUrl.match(/\/v\d+\/([^\/]+)\.[a-z]{3,4}$/i);
    const videoPublicIdMatch = videoUrl.match(/\/video\/upload\/v\d+\/([^\/]+)\.[a-z0-9]+$/i);

    console.log(thumbnailPublicIdMatch, videoPublicIdMatch)

    if (!thumbnailPublicIdMatch) {
        throw new ApiError(400, "Invalid thumbnail URL format");
    }

    if (!videoPublicIdMatch) {
        throw new ApiError(400, "Invalid video URL format");
    }

    const thumbnailPublicId = thumbnailPublicIdMatch[1];
    const videoPublicId = videoPublicIdMatch[1];

    const thumbnailDeletionResult = await deleteFromCloudinary(thumbnailPublicId, "image");
    if (!thumbnailDeletionResult) {
        throw new ApiError(500, "Error deleting old thumbnail");
    }

    const videoDeletionResult = await deleteFromCloudinary(videoPublicId, "video");
    if (!videoDeletionResult) {
        throw new ApiError(500, "Error deleting old video file");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deletedVideo) {
        throw new ApiError(400, "Error deleting video record");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId) {
        throw new ApiError(400, "VideoId required")
    }
    const video = await Video.findById(videoId)

    video.isPublished = !video.isPublished

    const published =video.isPublished

    video.save();

    return res
    .status(200)
    .json(new ApiResponse(200, published, "isPublished status change successfully"))

})

export {
    publishVideo,
    getVideoById,
    uploadVideo,
    deleteVideo,
    togglePublishStatus
}