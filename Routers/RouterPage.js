import express from "express";
import {} from "dotenv/config.js";
import { URLModel, UserModel } from "../Helpers/MongooseValidation.js";
import nodemailer from 'nodemailer';
import { generateShortUrl } from "../Helpers/GenerateURL.js";
import { generateToken } from "../Helpers/GenerateToken.js";
import { isAuth } from "../Helpers/isAuth.js";
import { passwordComparing, passwordHashing } from "../Helpers/Hashing.js";

const router = express.Router();

router.get("/",async(req,res)=>{
    res.status(200).json({message:"URL shortener app"})
})
//Creating new account for the user....
router.post('/signup',async(req,res)=>{
    try {
        const user = await UserModel.findOne({email:req.body.email});
        //Checking... user present or not
        if(user){
            return res.status(403).json({message : "User already exists"});
        }
        const hashedPassword = await passwordHashing(req.body.password);
        const newUser = await UserModel({
            userName:req.body.userName,
            email:req.body.email,
            password:hashedPassword
        }).save();
        //Mail transporter
        let transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.USER,
                pass:process.env.PASS
            }
        })
        //Message for mail
        let message = {
            from: 'abdulwasimsguvi@gmail.com',
            to: req.body.email,
            subject: "url short", 
            text: "url short", 
            html: "<b>url short</b>", 

        }
        //Sending activation link mail
        let sendMail = await transporter.sendMail(message);
        res.status(200).json({message:"Check your mail for activation link",newUser});
    } catch (error) {
        res.status(500).json({message:"Unable to signup"})
    }
});

router.put('/activation',async(req,res)=>{
    try {
        const user = await UserModel.findOne({email:req.body.email});
        //Checking... user present or not
        if(!user){
            return res.status(403).json({message : "No user found"});
        }
        const updatedUser = await UserModel.updateOne({email:req.body.email},{$set:{status:"active"}});
        res.status(200).json({message:"Account activated"})
    } catch (error) {
        res.status(500).json({message:"Unable to activate your account...Try Again later"});
    }
});

router.post('/login',async(req,res)=>{
    try {
        const user = await UserModel.findOne({email:req.body.email});
        //Checking... user present or not
        if(!user){
            return res.status(403).json({message : "Invalid credential "});
        }
        const verification = await passwordComparing(req.body.password,user.password);
        if(!verification){
            return res.status(403).json({message : "Invalid credential "});
        }
        //token generating
        const token = await generateToken(req.body.email);
        res.status(200).json({message:"login success",token,email:user.email});
        
    } catch (error) {
        res.status(500).json({message:"Unable to login...Try Again later"});
    }
    
});

router.put('/forgetpassword',async(req,res)=>{
    try {
        const user = await UserModel.findOne({email:req.body.email});
        //Checking... user present or not
        if(!user){
            return res.status(403).json({message : "No user found"});
        }
        //token generating
        const token = await generateToken(req.body.email);

        //Mail transporter
        let transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.USER,
                pass:process.env.PASS
            }
        })
        //Message for mail
        let message = {
            from: 'abdulwasimsguvi@gmail.com',
            to: req.body.email,
            subject: "password reset", 
            text: "password reset", 
            html: "<b>password reset</b>", 

        }
        //Sending password reset link mail
        let sendMail = await transporter.sendMail(message);

        res.status(200).json({message:"Check you mail for reset link success",token,email:user.email});
        
    } catch (error) {
        res.status(500).json({message:"Unable to login...Try Again later"});
    }
});


router.put('/resetpassword',isAuth,async(req,res)=>{
    try {
        const user = await UserModel.findOne({email:req.body.email});
        //Checking... user present or not
        if(!user){
            return res.status(403).json({message : "No user found"});
        }
        const hashedPassword = await passwordHashing(req.body.password);
        const updatedUser = await UserModel.updateOne({email:req.body.email},{$set:{password:hashedPassword}});
        res.status(200).json({message:"password updated"})
    } catch (error) {
        res.status(500).json({message:"Unable to updated password...Try Again later"});
    }
});

router.get('/shorturl',async(req,res)=>{
    const shortUrls = await URLModel.find({email:req.body.email});
    if(shortUrls.length===0){
        return res.status(403).json({message:"No URL found"})
    }
    res.status(200).json({message:"shorturls",shortUrls});
});


//Creating new Short URL....
router.post('/shorturl',isAuth,async(req,res)=>{
    try {
        const user = await UserModel.findOne({email:req.body.email});
        if(!user){
            return res.status(403).json({message:"User not found"})
        }
        const status = user.status;
        if(status==="inactive"){
            return res.status(400).json({message:"Please activate your account"})
        }
        
        let newUrl = await URLModel({
            email:"abdulwasimsmech@gmail.com",
            short_url:await generateShortUrl(),
            long_url:req.body.long_url,
            urlName:req.body.urlName
        }).save();
        
        res.status(200).json({message:"success",newUrl});
    } catch (error) {
        res.status(500).json({message:"Unable to create ShortURL...Try again",error})
    }
});

//Deleting the url....
router.delete('/deleteurl',isAuth,async(req,res)=>{
    try {
        const user = await UserModel.findOne({short_url:req.body.url});
        if(!user){
            return res.status(403).json({message:"URL not found"})
        }
        let urlToDelete = await URLModel.deleteOne({short_url:req.body.url})
        
        res.status(200).json({message:"deleted successfully"});
    } catch (error) {
        res.status(500).json({message:"Unable to delete ShortURL...Try again",error})
        console.log(error);
    }
});

//Redirecting the link to original page
router.get('/:url',async(req,res)=>{
    try {
        const urlData = await URLModel.findOne({short_url:req.params.url});
        if(!urlData){
            return res.status(403).json({message:"URL not found"})
        }
        
        res.redirect(urlData.long_url);
    } catch (error) {
        res.status(500).json({message:"Unable to delete ShortURL...Try again",error})
        console.log(error);
    }
});

export const RouterPage = router;