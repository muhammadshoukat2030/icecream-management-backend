const jwt=require('jsonwebtoken')
const dbAdmin=require('./adminSchema')

 signToken=(id)=>{
   return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    }
    );
}
exports.signToken=signToken
exports.login=(async(req,res,next)=>{
    //email and passwod check

    const {email,password}=req.body
       console.log(email,password)
    if(!email||!password){
        return res.status(400).json({
            status:'failed',
            message:'please provide email and password'
        })
    }
    //check if the user exists and the password is correct
    const checkUser=await dbAdmin.findOne({email}).select('password');
    if(!checkUser||!(password===checkUser.password)){
        return res.status(401).json({
            status:'failed',
            message:'invalid email or password'
        })
    }


        // send the token
        const token=signToken(checkUser._id);
            console.log('sending cookies',token)
            res.cookie('token',token,{  

                  httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.status(200).json({
                status:'success',
                message:'Logged In successfully'
            })
           
})

exports.protect=async(req,res,next)=>{
    //1check if the token is here
    console.log(req.cookies.token)
const token=req.cookies.token;
if(!token){
  return res.status(401).json({
        status: 'failed',
        message: 'You are not logged in'
    });
       
}
//2verify the token
decoded=jwt.verify(token,process.env.JWT_SECRET);
console.log(decoded);
const freshUser=await dbAdmin.findById(decoded.id)
console.log(freshUser)
//3check if the user still exists
if(!freshUser){
    res.status(401).json({
        status:'failed',
        message:'the user doesnot exist anymore'
    })
}
/////////////
//4 check if the user changed the password
//i skip this step because the above steps are sufficient for now
//////////////////////////////////////

///5 Grant Access
req.user=freshUser

next(); 
}

exports.GetMe=async(req,res,next)=>{
     const token=req.cookies.token;
     decoded=jwt.verify(token,process.env.JWT_SECRET);
console.log(decoded);
const freshUser=await dbAdmin.findById(decoded.id)
console.log(freshUser)
res.send(freshUser);
}