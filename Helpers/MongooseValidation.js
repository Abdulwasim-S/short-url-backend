import mongoose from "mongoose";

const userSchema = await mongoose.Schema({
    userName:{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true
    },
    password:{
        type : String,
        required : true
    },
    status:{
        type : String,
        required : true,
        default : "inactive"
    }
})

const urlSchema = mongoose.Schema({
    email : {
        type : String,
        required : true,
    },
    urlName:{
        type : String,
        required : true,
        default : "No name"
    },
    short_url : {
        type : String,
        required : true,
        unique: true
    },
    long_url : {
        type : String,
        required : true
    },
    click_count : {
        type : Number,
        default : 0
    },
})

export const UserModel = mongoose.model("users",userSchema);
export const URLModel = mongoose.model("urls",urlSchema);