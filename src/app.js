
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
import subscription from './routes/subscription.routes.js'
import playlistRouter from './routes/playlist.routes.js'

// declare routes
app.get('/',(req,res)=>{
    res.json({
        message: "Welcome to Youtube API"
    })
})
app.get('/api/v1/',(req,res)=>{
    res.json({
        message: "Go to /api/v1/users to getting started"
    })
})
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscription);
// app.use("/api/v1/comments", commentRouter)
// app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
// app.use("/api/v1/dashboard", dashboardRouter)
// app.use("/api/v1/healthcheck", healthcheckRouter)
// app.use("/api/v1/tweets", tweetRouter)

export default app;