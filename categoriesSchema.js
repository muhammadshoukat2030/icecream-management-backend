const mongoose=require('mongoose');
const categoriesSchema=new mongoose.Schema({
    id:{
        type:Number,
        required:[true,'A category must have the id'],
        unique:true
    },
    name:{
        type:String,
        required:[true,'A category must have name'],
        unique:true
    } ,

    Description:{
        type:String,
        },

           
     totalProducts:{
        type:Number
    }
})
const dbCategories=mongoose.model("categories",categoriesSchema)
module.exports=dbCategories;