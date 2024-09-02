import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port : ${process.env.PORT}`);
    })
    app.on("error", () => {
        console.log("ERROR : ", error)
        throw error
    })
}) 
.catch((error) => {
    console.log("MongoDb connect to failed...", error);
})




















/*

import express from 'express'
const app=express();
// function connectDB();

(async() => {
    try {
        await mongoose.connect(`${process.env.MONODB_URI}`/{DB_NAME})
        app.on("error", () => {
            console.log("ERROR", error);
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port: ${PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})();

*/