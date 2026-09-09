const mongoose=require('mongoose');
const validator=require('validator');
const userSchema=new mongoose.Schema({
    
        name:{
        type:String,
        required:true,
        maxlength:[40,'a user should have max length equal to 40'],  
        minlength:[6,'a user should have min length equal to 6']    
    },
        email:{
        type:String,
        unique:true,
        required:[true,'a user should have an email adress'],
         Validate:[validator.isEmail,'please provide a valid email']
        },
        role:{
            type:String,
            enum:['admin'],
            default:'user'
        },
         password:{
        type:String,
        required:[true,'a user must enter password'],
        // validator:passwordCheck
        minlength:[8,'please enter password equal to or greater than 8 characters'],
        select:false    
    },

       passwordChangedAt: {
  type: Date
}
})
const user=mongoose.model('user',userSchema);
module.exports=user;