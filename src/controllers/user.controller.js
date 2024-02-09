
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteCloudinaryImage, uploadImageToCloudinary } from "../utils/cloudinary/cloudinary.js";

export const generateAccessAndRefreshtokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({
            validateBeforeSave: false
        })
        return { accessToken, refreshToken }
    } catch (err) {
        throw new ApiError(500, "Token generation failed")
    }
}

export const register = asyncHandler(async (req, res, next) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    if (email?.trim() === "" || !email?.includes("@")) {
        throw new ApiError(400, "Invalid email")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    const avatar = await uploadImageToCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed")
    }
    const coverImage = await uploadImageToCloudinary(coverImageLocalPath)

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: email.toLowerCase(),
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken") // the fields we don't want to return
    if (!createdUser) {
        throw new ApiError(500, "User creation failed")
    }


    res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

});

export const login = asyncHandler(async (req, res, next) => {

    const { email, username, password } = req.body
    console.log(email);

    if (!(username || email)) {
        throw new ApiError(400, "Either username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "user does not exist");
    }
    const matchPassword = await user.comparePassword(password);

    if (!matchPassword) {
        throw new ApiError(401, "password is incorrect");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshtokens(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
        })
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
        })
        .json(
            new ApiResponse(200, { accessToken, loggedInUser, refreshToken }, "User logged in successfully")
        )
});

export const logout = asyncHandler(async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $set: {
                refreshToken: undefined
            }
        },
            {
                new: true
            }
        )
        const option = {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now()),
        }
        req.user = null
        res.clearCookie("accessToken", option)
        res.clearCookie("refreshToken", option)
        res.status(200).json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
    } catch (err) {
        throw new ApiError(500, "Logout failed", err)
    }
});

export const userDetails = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        res.status(200).json(
            new ApiResponse(200, user, "User details fetched successfully")
        )
    } catch (err) {
        throw new ApiError(500, "User details fetch failed", err)
    }
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incoming_refreshToken = req.cookies.refreshToken || req.body
    if (!incoming_refreshToken) {
        throw new ApiError(401, 'unauthorized')
    }
    try {
        const decoded = jwt.verify(incoming_refreshToken, process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(decoded._id)
        if (!user) {
            throw new ApiError(401, 'Invalid refresh token')
        }
        if (incoming_refreshToken !== user.refreshToken) {
            throw new ApiError(401, 'Invalid refresh token or used')
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshtokens()
        return res
            .status(200)
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
            })
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
            })
            .json(
                new ApiResponse(200, { accessToken, refreshToken }, "new refreshToken generated successfully")
            )
    } catch (error) {
        throw new ApiError(401, error.message || 'Invalid refresh token')
    }
})


export const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    let { currentPassword, newPassword, confirmPassword } = req.body
    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(401, "user does not exist");
    }
    const matchPassword = await user.comparePassword(currentPassword);

    if (!matchPassword) {
        throw new ApiError(400, "Invalid old password")
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "password didn't match ");
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})


export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
});

export const updateUserAvatar = asyncHandler(async (req, res, next) => {
    try {
        const avatarPath = req.file?.path
        if (!avatarPath) {
            throw new ApiError(400, "Avatar file is required")
        }

        const userAvatar = await User.findById(req.user?._id)

        const deletePreviousImg = await deleteCloudinaryImage(userAvatar.avatar)

        if (deletePreviousImg.status !== 'ok') {
            throw new ApiError(500, "Avatar delete failed")
        }

        const avatar = await uploadImageToCloudinary(avatarPath)

        if (avatar.url === '') {
            throw new ApiError(500, "Error while avatar upload")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url
                }
            },
            { new: true }
        ).select("-password ")
        res.status(200).json(
            new ApiResponse(200, user, "Avatar updated successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Avatar upload failed", error)
    }
})

export const updateUserCoverImage = asyncHandler(async (req, res, next) => {
    try {
        const coverImagePath = req.file?.path
        if (!coverImagePath) {
            throw new ApiError(400, "CoverImage file is required")
        }
        // coverImage: coverImage?.url || "",
        const user = await User.findById(req.user?._id)

        const deletePreviousImg = await deleteCloudinaryImage(user.coverImage)

        if (deletePreviousImg.status !== 'ok') {
            throw new ApiError(500, "CoverImage delete failed")
        }

        const coverImage = await uploadImageToCloudinary(coverImagePath)

        if (coverImage.url === '') {
            throw new ApiError(500, "Error while coverImage upload")
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    coverImage: coverImage.url
                }
            },
            { new: true }
        ).select("-password ")
        res.status(200).json(
            new ApiResponse(200, updatedUser, "CoverImage updated successfully")
        )
    } catch (error) {
        throw new ApiError(500, error, "CoverImage upload failed")
    }
})

export const getUserChannelProfile = asyncHandler(async (req, res, next) => {
    try {
        const { username } = req.params
        if (!username.trim()) {
            throw new ApiError(400, "username is required")
        }

        const channelInfo = await User.aggregate([
            {
                $match: {
                    username: username.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscriberTo"
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
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
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
                    coverImage: 1,
                    email: 1

                }
            }

        ])
        if (!channelInfo?.length) {
            throw new ApiError(404, "channel does not exists")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, channelInfo[0], "User channel fetched successfully")
            )
    } catch (error) {
        throw new ApiError(500, error, "CoverImage upload failed")
    }
})

