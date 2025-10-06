import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: Number
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    },
    role : {
        type : String,
        default : "user"
    },
    cart : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            default : []
        }
    ]
},{timestamps: true})

export const User = mongoose.model("User",userSchema);