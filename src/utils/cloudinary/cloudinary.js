import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


export const uploadToCloudinary = async (file) => {
    try {
        if (!file) return null;
        const uploadedImage = await cloudinary.uploader.upload(file, {
            resource_type: "auto"
        });
        // console.log(uploadedImage);
        fs.unlinkSync(file) // remove the locally saved temporary file after upload
        return uploadedImage;
    } catch (error) {
        fs.unlinkSync(file) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}
