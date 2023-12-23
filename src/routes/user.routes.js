
import express from "express"
import { login, register, logout, userDetails, refreshAccessToken } from "../controllers/user.controller.js";
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

router.route('/logout').post(verifyToken, logout)

router.route('/user').get(verifyToken, userDetails);

router.route('/refresh-token').post(refreshAccessToken);



export default router


