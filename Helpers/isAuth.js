import jwt from "jsonwebtoken";
import {} from 'dotenv/config.js'

const isAuth=async(req,res,next)=>{
    let token;
    if(req.headers){
        try {
            token =await req.headers['x-auth-token']
            const decode = jwt.verify(token,process.env.SECRET_KEY);
            if(decode){
                next();
            }
        } catch (error) {
            res.status(500).json({message:"Can't authenticate",error})
        }
    }
    if(!token){
        res.send("Access denied...")
    }

}
export {isAuth};