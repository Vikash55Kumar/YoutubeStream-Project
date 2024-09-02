import express from 'express'
import cors from "cors"
import bodyParser from "body-parser"
import cookieParser from 'cookie-parser';

const app=express();
app.use(cors({
    origin:process.env.CORES_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true, limit:"20kb"}))
app.use(express.static("public"))
app.use(bodyParser.json());
app.use(cookieParser())

//routers import 
import userRouter from "./routes/user.route.js"
import tweetRouter from "./routes/tweet.router.js"
import subscriptionRouter from "./routes/subscription.router.js"
import likeRouter from "./routes/like.router.js"
import videoRouter from "./routes/video.router.js"


//router declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweeter", tweetRouter)
app.use("/api/v1/suscription", subscriptionRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/videos", videoRouter)





// http://localhost:8080/api/v1/users/register
// http://localhost:8080/api/v1/users/login

export {app}