import mongoose, { Schema } from "mongoose";

const subscriptionSchema= new Schema({
    subscriber: {
        type:Schema.Types.ObjectId,  //who is subscribing
        ref:"User"
    },
    channel: {
        type:Schema.Types.ObjectId,  //whome "subscriber" is subscribing 
        ref:"User"
    },
    createdAt: {
        type:Date,
    },
    updatedAt: {
        type:Date
    } 
}, {timestamps:true})

export const Subscription= mongoose.model("Subscription", subscriptionSchema)