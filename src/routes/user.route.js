import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/forgetPassword").post(verifyJWT, changeCurrentPassword)

router.route("/getUser").get(getCurrentUser)

router.route("/updateAccount").patch(verifyJWT, updateAccountDetails)

router.route("/updateAvatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/updateCoverImage").patch(verifyJWT, upload.single("avatar"), updateUserCoverImage)

router.route("/channelProfile").post(getUserChannelProfile)


// secure routers
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;