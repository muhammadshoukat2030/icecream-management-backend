const mongoose=require('mongoose');
// const Supplier = require("./supplierSchema"); // your supplier model
const Category=require('./categoriesSchema')


const productSchema = new mongoose.Schema({

    id: {
        type: Number,
        required: [true, "A product should have an id"],
        unique: true
    },

    name: {
        type: String,
        required: [true, "A product should have a name"]
    },

    company: {
        type: String,
        required: [true, "A product should have a company"],

        // validate: {
        //     validator: async function(value) {

        //         const supplier = await Supplier.findOne({
        //             name: value
        //         });

        //         return supplier !== null;

        //     },

        //     message: "Company must exist in suppliers list"
        // }
    },
    purchasePrice:{
        type:Number,
        required:[true,'A product should have a purchase price']
    },

    salePrice:{
        type:Number,
        required:[true,'A product should have the purchase price']
    },
    category:{
        type:String,
        required:[true,'A product should have the category'],
          validate: {
            validator: async function(value) {

                const category = await Category.findOne({
                    name: value
                });

                return category !== null;

            },

            message: "Category must exist in categories list"
        }
    },
    qunatity:{
        type:Number,
        default:0
    },
    lastPurchase:{
        type:String,
        default:"YYYY-MM-DD"
    },

    commissionApplicable:{
        type:String,
        default:"yes"
    },
    lastReturn:{
        type:Number,
        default:0
    }

}); 

const Product = mongoose.model("Product", productSchema);

module.exports = Product;