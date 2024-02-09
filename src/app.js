
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";


const app = express();


app.use(cors(
    {
        origin: ["http://localhost:8000"],
        credentials: true
    }
));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser());

// import routes
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
// declare routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);

export default app;