import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const platlistSchema = new Schema({
    name: {
        type:String,
        required:true
    },
    description: {
        type:String,
        required:true
    },
    video: [
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    owner: {
        type:Schema.Types.ObjectId,
        ref:"Owner"
    },
}, {timeseries:true}

)

export const Playlist = mongoose.model("Playlist", platlistSchema)