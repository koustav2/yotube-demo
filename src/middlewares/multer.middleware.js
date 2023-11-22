import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    }
    ,
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/gif" || file.mimetype == "image/svg+xml" || file.mimetype == "image/webp" || file.mimetype == "image/tiff" || file.mimetype == "image/bmp" || file.mimetype == "image/x-icon" || file.mimetype == "image/vnd.microsoft.icon" || file.mimetype == "image/ico" || file.mimetype == "image/icon" || file.mimetype == "image/x-icon" || file.mimetype == "image/svg") {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

export default upload;

