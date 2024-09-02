import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // console.log("Generated Access Token:", accessToken);
        // console.log("Generated Refresh Token:", refreshToken);
        console.log("token generated")

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiError(500, "Something went wrong in generating refresh and access tokens");
    }
};

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName, email, username, password } = req.body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
 
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
});

const loginUser = asyncHandler(async (req, res) => {
    // request =data
    // username  || email
    // find user
    // password check
    // access and refresh token
    // send cookie
    const {username, email, password}=req.body;
    
    if(!(username || email)) {
        throw new ApiError(400, "username or email not require");
    }
// User can login by email or username
    const user =await User.findOne({
        $or: [{username}, {email}]
    })

    // check user match or not 
    if(!user) {
        throw new ApiError(400, "username or email not match");
    };

    // check password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credientials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
});

const logoutUser = asyncHandler( async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, 
        {
            new: true
        }
    )
    const options = {
        httpOnly : true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"User logout Successfully"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthorize request")
    }
    // decode token
    try {
        const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expire or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json (
            new ApiResponse (200, {accessToken, refreshToken: newRefreshToken},"Access token refreshed")
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassward, newPassword, conformPassword}=req.body
    console.log(oldPassward, newPassword, conformPassword)
    if(!(newPassword ===conformPassword)) {
        throw new ApiError(400, "Conform password not match")
    }
    // req.id from auth.middleware
    const user = await User.findById(req.user?._id)
    console.log(user)
    // check passward user.mode -- custome domain
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassward)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "old password not match")
    }

    user.password=newPassword

   await user.save({ validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, "Password change successfull"))

})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler( async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email) {
        throw new ApiError(400, "required email or fullname")
    }

    const  user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName:fullName,
            email:email
        }
    }, {new:true}

    ).select("-password")   // password not update

    return res
    .status(200)
    .json(new ApiResponse(200, user, "fullname or email updated successfull"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const user= await User.findById(req.user?._id)
    const avatarLocalPath = req.file?.path

    const currentAvatarUrl = user.avatar;

    // Extract publicId from URL
    const publicIdMatch = currentAvatarUrl.match(/\/v\d+\/([^\/]+)\.[a-z]{3,4}$/i);
    if (!publicIdMatch) {
        throw new ApiError(400, "Invalid avatar URL format");
    }

    const publicId = publicIdMatch[1];
    const deletionSuccessful = await deleteFromCloudinary(publicId);

    if (!deletionSuccessful) {
        throw new ApiError(500, "Error deleting old avatar");
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
        throw new ApiError(400, "error while uploading avatar")
    }

    const updateAwatar= await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar:avatar.url
        }
    }, {new:true}
    ).select("-password") 

    return res
    .status(200)
    .json(new ApiResponse(200, updateAwatar, "Avatar update successfull"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path
    const user= await User.findById(req.user?._id)

    const currentCoverImageUrl = user.coverImage;

    // Extract publicId from URL
    const coverPublicIdMatch = currentCoverImageUrl.match(/\/v\d+\/([^\/]+)\.[a-z]{3,4}$/i);
    if (!coverPublicIdMatch) {
        throw new ApiError(400, "Invalid coverImage URL format");
    }

    const publicId = coverPublicIdMatch[1];

    const deletionSuccessful = await deleteFromCloudinary(publicId);

    if (!deletionSuccessful) {
        throw new ApiError(500, "Error deleting old coverImage");
    }

    if(!coverLocalPath) {
        throw new ApiError(400, "CoverImage not found for update")
    }

    const coverImage=await uploadOnCloudinary(coverLocalPath)

    if(!coverImage.url) {
        throw new ApiError(400, "error while uploading coverImage")
    }

    const updateCoverImage= await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage:coverImage.url
        }
    }, {new:true}
    ).select("-password") 

    return res
    .status(200)
    .json(new ApiResponse(200, updateCoverImage, "CoverImage update successfull"))

})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.body

    if(!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField:"_id",
                foreignField:"suscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                email: 1,
                coverImage: 1,
            }
        }
    ])
    if (channel?.length) {
        const {
            fullName, 
            email, 
            subscribersCount, 
            channelsSubscribedToCount, 
            isSubscribed
        } =channel[0];
        console.log(fullName, email, subscribersCount, channelsSubscribedToCount, isSubscribed)
    } else {
        throw new ApiError(404, "channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiError(404, "channel does not exists")
    )
})


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,

 };
