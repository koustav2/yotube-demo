
import express from "express"
import { login,register,logout, userDetails } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();



router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ])
    , register)

router.route('/login').post(login)

router.route('/logout').post(verifyToken,logout)

router.route('/user').get(verifyToken, userDetails);




export default router


