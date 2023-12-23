import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

// create s3 instance using S3Client 
// (this is how we create s3 instance in v3)
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // store it in .env file to keep it safe
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY // store it in .env file to keep it safe
    },
    region: "ap-south-1" // this is the region that you select in AWS account
})

// create a multer storage using multerS3

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
}).fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]);

// export this middleware

export default upload;