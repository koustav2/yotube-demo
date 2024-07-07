import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }
    const existingPlaylist = await Playlist.findOne({ name, userId })
    if (existingPlaylist) {
        throw new ApiError(400, "Playlist with the same name already exists")
    }
    const newPlaylist = await Playlist.create({ name, description, userId })
    return res.status(200).json(new ApiResponse(
        200,
        newPlaylist,
        "Playlist created successfully"
    ))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }
    const playlists = await Playlist.find({ userId }).populate("videos")
    return res.status(200).json(new ApiResponse(
        200,
        playlists,
        "User playlists fetched successfully"
    ))
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if(!playlistId) {
        throw new ApiError(400, "Playlist Id is required")
    }
    const playlist = await Playlist.findById(playlistId).populate("videos")
    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponse(
        200,
        playlist,
        "Playlist fetched successfully"
    ))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) ||!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId")
    };

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    };

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found")
    };

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the playlist")
    };

    playlist.videos.push(videoId);
    await playlist.save();
    return res.status(200).json(new ApiResponse(
        200,
        playlist,
        "Video added to playlist successfully"
    ));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) ||!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId")
    };
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    };
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    };
    playlist.videos = playlist.videos.filter((id) => id.toString()!== videoId);
    await playlist.save();
    return res.status(200).json(new ApiResponse(
        200,
        playlist,
        "Video removed from playlist successfully"
    ));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    };
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    };
    return res.status(200).json(new ApiResponse(
        200,
        playlist,
        "Playlist deleted successfully"
    ));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    };
    const playlist = await Playlist.findByIdAndUpdate(playlistId, { name, description }, { new: true });
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    };
    return res.status(200).json(new ApiResponse(
        200,
        playlist,
        "Playlist updated successfully"
    ));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}