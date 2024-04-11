import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyToken); // Apply verifyJWT middleware to all routes in this file
router.route("/c/:channelId").get(getSubscribedChannels)
router.route("/c/:channelId").post(toggleSubscription);
router.route("/u/:subscriberId").get(getUserChannelSubscribers);


export default router