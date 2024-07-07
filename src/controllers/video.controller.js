/* eslint-disable no-unused-vars */
import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteCloudinaryImage, uploadImageToCloudinary, uploadVideoToCloudinary } from "../utils/cloudinary/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 4, query, sortBy, sortType, userId } = req.query

    // ?page=1&sortBy=views&sortType=asc&limit=4
    const parsedLimit = parseInt(limit);
    const pageSkip = (page - 1) * parsedLimit;
    const sortStage = {};
    sortStage[sortBy] = sortType === 'asc' ? 1 : -1;

    const allVideo = await Video.aggregate([
        {
            $match: {
                owner: userId ? mongoose.Types.ObjectId(userId) : { $exists: true },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerResult",
                pipeline: [

                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            email: 1
                        }
                    }
                ]
            },

        },

        {
            $addFields: {
                user: {
                    $arrayElemAt: ["$ownerResult", 0],
                },
            },
        },
        {
            $sort: sortStage
        },
        {
            $skip: pageSkip,
        },
        {
            $limit: parsedLimit,
        },
        {
            $project: {
                ownerResult: 0,
                __v: 0,
            }
        }

    ]
)

    res
        .status(200)
        .json(new ApiResponse(200, allVideo, 'Success'))
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const userId = req.user._id;

    if (!(title && description)) {
        throw new ApiError(400, "title and description must be provided");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if (!(videoLocalPath || thumbnailLocalPath)) {
        throw new ApiError(400, "File not found");
    }
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const thumbnailUrl = await uploadImageToCloudinary(thumbnailLocalPath);
    const videoFileUrl = await uploadVideoToCloudinary(videoLocalPath);


    const video = new Video({
        title,
        description,
        videoFile: videoFileUrl?.url || "",
        thumbnail: thumbnailUrl?.url || "",
        duration: videoFileUrl?.duration || 0,
        owner: userId
    });

    await video.save();

    res.status(201).json(new ApiResponse(201, "Video published successfully", video));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log(videoId)
    if (!videoId) {
        throw new ApiError(400, "Video Id is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    res.status(200).json(new ApiResponse(200, "Video found", video));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    if (!videoId) {
        throw new ApiError(400, "Video Id is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const thumbnailLocalPath = req.file?.path;
    let thumbnailUrl = video.thumbnail;
    if (thumbnailLocalPath) {
        await deleteCloudinaryImage(video.thumbnail);
        thumbnailUrl = await uploadImageToCloudinary(thumbnailLocalPath);
    }
    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnailUrl?.url || video.thumbnail;
    await video.save();
    res.status(200).json(new ApiResponse(200, "Video updated successfully", video));

});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video Id is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    await Video.findByIdAndDelete(videoId);
    await deleteCloudinaryImage(video.thumbnail);
    await deleteCloudinaryImage(video.videoFile);
    res.status(200).json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video Id is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    video.isPublished = !video.isPublished;
    await video.save();
    res.status(200).json(new ApiResponse(200, "Video publish status updated successfully", video));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};