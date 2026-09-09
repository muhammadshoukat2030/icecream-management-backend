const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({

    // coming from frontend
    id: {
        type: Number,
        required: true,
        unique: true
    },

    // "salesman" or "supplier"
    type: {
        type: String,
        enum: ["salesman", "supplier"],
        required: true
    },


    // ID coming from frontend
    partyId: {
        type: Number,
        required: true
    },


    // Name snapshot (optional but useful)
    partyName: {
        type: String,
        required: true
    },


    date: {
        type: Date,
        default: Date.now
    },


    items: [
        {
            productId: {
                type: Number,
                required: true
            },

            productName: {
                type: String,
                required: true
            },

            quantity: {
                type: Number,
                required: true
            },

            price: {
                type: Number,
                required: true
            },

            returnQuantity: {
                type: Number,
                default: 0
            },

            amount: {
                type: Number,
                required: true
            },
            commissionApplicable:{
                type:String,
                default:"yes"
   }

        }
    ],


    subtotal: {
        type: Number,
        required: true
    },


    commission: {
        type: Number,
        default: 0
    },


    discount: {
        type: Number,
        default: 0
    },


    netTotal: {
        type: Number,
        required: true
    },


    cash: {
        type: Number,
        default: 0
    },


    balance: {
        type: Number,
        default: 0
    },
   arrears:{
        type:Number,
        default:0

    },
    dynamicComission:{
        type:Number,
        default:0.2
    }
   

});


module.exports = mongoose.model(
    "Invoice",
    invoiceSchema
);