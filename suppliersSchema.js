const mongoose = require("mongoose");


const supplierSchema = new mongoose.Schema({

    // =====================
    // Basic Information
    // =====================

    id:{
        type:Number,
        required:[true,"Supplier must have an id"],
        unique:true
    },


    companyName:{
        type:String,
        required:[true,"Supplier company name required"]
    },


    contactPerson:{
        type:String,
        required:[true,"Contact person required"]
    },


    status:{
        type:Boolean,
        default:true
    },


    partnerSince:{
        type:String,
        default:""
    },



    // =====================
    // Contact Information
    // =====================

    phone:{
        type:String,
        required:[true,"Phone number required"]
    },


    whatsapp:{
        type:String
    },


    email:{
        type:String,
        required:[true,"Email required"],
        unique:true
    },


    address:{
        type:String,
        required:[true,"Address required"]
    },


    city:{
        type:String,
        required:[true,"City required"]
    },



    // =====================
    // Supplier Statistics
    // =====================


    outstandingBalance:{
        type:Number,
        default:0
    },


    totalPurchases:{
        type:Number,
        default:0
    },


    monthlyPurchases:{
        type:Number,
        default:0
    },


    totalProducts:{
        type:Number,
        default:0
    },


    lastPayment:{
        amount:{
            type:Number,
            default:0
        },

        date:{
            type:String,
            default:""
        }
    },



    // =====================
    // Company Logo
    // =====================

    logo:{
        type:String,
        default:""
    },


    // =====================
    // Products
    // =====================

    products:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        }
    ]

});


const Supplier = mongoose.model(
    "Supplier",
    supplierSchema
);


module.exports = Supplier;