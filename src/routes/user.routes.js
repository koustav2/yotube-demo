
import express from "express"
import { register } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
const router = express.Router();



router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ])
    ,register)

export default router


