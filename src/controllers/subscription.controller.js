import { Subscription } from "../models/subscription.model.js";
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// channel subscribed <---> Unsubscribed
const toggleScription = asyncHandler(async(req, res) => {
    // check channelId exist
    // determine user already subscribed 
    // toggle subscription status
    // response Message
    
    const {channelId} = req.params
    
    const userId=req.user?.id

    if(!channelId) {
        throw new ApiError(400, "Channel id required")
    }

    const subscribed= await Subscription.findOne({
        channel:channelId,
        subscriber:userId
    })
    if (subscribed) {
        await Subscription.deleteOne({channel:channelId,subscriber:userId})
        return res
        .status(201)
        .json(new ApiResponse(200, "channel Unsubscribed successfully"))
    } else {
        await Subscription.create({channel:channelId,subscriber:userId})
        return res
        .status(201)
        .json(new ApiResponse(200, "channel Subscribed successfully"))
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // check channel exist
    // find no of subscriber
    // show message

    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Channel ID required");
    }

    const subscribed = await Subscription.find({ 
        channel: channelId 
    }).populate('subscriber', 'fullName email'); // Adjust fields as needed

    if (!subscribed || subscribed.length === 0) {
        return res
            .status(404)
            .json(new ApiResponse(404, [], "No subscriptions found for this channel"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribed, "Subscriptions fetched successfully"));
});

const getSubscribedChannels = asyncHandler(async(req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID required");
    }

    const subscribed = await Subscription.find({ subscriber: subscriberId }).populate('subscriber', 'fullName email'); // Adjust fields as needed

    if (!subscribed || subscribed.length === 0) {
        return res
            .status(404)
            .json(new ApiResponse(404, [], "No channel subscribed by the subscriptions"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribed, "Channel fetched successfully"));
    
})

export {
    toggleScription,
    getUserChannelSubscribers,
    getSubscribedChannels
}