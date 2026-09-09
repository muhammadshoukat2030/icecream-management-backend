const mongoose = require("mongoose");


const salesmanSchema = new mongoose.Schema({

    id:{
        type:Number,
        required:[true,"A salesman should have the id"],
        unique:true
    },


    name:{
        type:String,
        required:[true,"A salesman should have a name"]
    },


    phone:{
        type:String,
        required:[true,"A salesman should have phone number"]
    },


    address:{
        type:String,
        required:[true,"A salesman should have address"]
    },


    status:{
        type:Boolean,
        default:true
    },
route:{
    type:String
},

    // ======================
    // Sales Statistics
    // ======================


    outstandingBalance:{
        type:Number,
        default:0
    },


    todayIssued:{
        type:Number,
        default:0
    },


    totalInvoices:{
        type:Number,
    },


    totalPayments:{
        type:Number,
       
    },



    // ======================
    // Personal Information
    // ======================


    cnic:{
        type:String,
        required:[true,"A salesman should have CNIC"],
        unique:true
    },


    email:{
        type:String,
        required:[true,"A salesman should have email"],
        unique:true
    },


    dateOfBirth:{
        type:String,
        
    },


    photo:{
        type:String,
        default:"images/default-user.png"
    }


});


const Salesman = mongoose.model(
    "salesMen",
    salesmanSchema
);


module.exports = Salesman;