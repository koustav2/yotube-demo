
import express from "express"
import { login, register, logout, userDetails, refreshAccessToken, changeCurrentPassword, updateAccountDetails, updateUserAvatar } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();



router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ])
    , register)

// router.route("/register").post(
//     upload,
//     register                   n 
// );


router.route('/login').post(login)
router.route('/user').get(verifyToken, userDetails);
router.route("/change-password").post(verifyToken, changeCurrentPassword)
router.route("/update-account").patch(verifyToken, updateAccountDetails)
router.route("/update-avatar").post(verifyToken, upload.single("avatar"),  updateUserAvatar)
router.route('/refresh-token').post(refreshAccessToken);
router.route('/logout').post(verifyToken, logout)


export default router


