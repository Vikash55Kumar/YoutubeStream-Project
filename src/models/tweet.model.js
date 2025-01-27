import mongoose from "mongoose"
import { Schema} from "mongoose"

const tweeterSchema = new Schema({
    owner: {
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    content: {
        type:String,
        required:true
    }
}, 
{timestamps:true}
)

export const Tweet=mongoose.model("Tweet", tweeterSchema)