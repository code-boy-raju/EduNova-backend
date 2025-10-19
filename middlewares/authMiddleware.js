const jwt=require('jsonwebtoken');
 const {userModel}=require("../models/registerModel.js")
 require('dotenv').config();


const authMiddleware=async(req,res,next)=>{
    const {authorization}=req.headers;
    if(!authorization) return res.status(401).send("Access denied");
    const token= authorization.split(" ")[1];
    try {
        const verified=jwt.verify(token,process.env.JWT_SECRET);
const user=await userModel.findById(verified.id,{_id:true,email:true,username:true,role:true});
if(!user) return res.status(401).send("User not found");
        req.user=user;
        next();
    } catch (error) {
        console.log(error);
        
        res.status(400).send("Invalid token");
    }
};



const authorizationMiddleware=(...roles)=>(req,res,next)=>{
    if(!roles.includes(req.user.role)){
        return res.status(403).send("You are not authorized to access this resource");
    }
    next();
};


module.exports={authMiddleware,authorizationMiddleware}