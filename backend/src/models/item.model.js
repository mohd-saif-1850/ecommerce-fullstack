import mongoose,{Schema} from "mongoose";

const itemSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    quanity : {
        type : Number,
        default : 1
    },
    description : {
        type : String,
        default : ""
    },
    imageUrl : {
        type : String,
        required : true
    }
},{timestamps: true})

export const Item = mongoose.model("Item",itemSchema)