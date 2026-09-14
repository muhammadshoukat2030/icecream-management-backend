const dotenv = require('dotenv');

dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const mongoose = require('mongoose');
const connectDB = require("./db");
const app = express();


// ==============================
// CORS
// ==============================
const allowedOrigins = [
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "https://icecream-management-opal.vercel.app",
];

app.use(cors({

    origin: function (origin, callback) {

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }

    },
    credentials: true
}));
// ==============================
// BODY PARSING
// ==============================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ==============================
// COOKIE PARSER
// ==============================

app.use(cookieParser());

app.use(async (req, res, next) => {

    try {

        await connectDB();

        next();

    } catch (error) {

        console.error(
            "Database unavailable:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Database connection failed"
        });

    }

});

// ==============================
// PORT
// ==============================

const port = 5000;


// ==============================
// DATABASE / MODELS
// ==============================

const dbCategories = require('./categoriesSchema');
const dbProduct = require('./productsSchema');
const dbSalesman = require('./salesmanSchema');
const dbSuppliers = require('./suppliersSchema');
const dbInvoice = require('./invoiceSchema');

const authController = require('./authController');


// ==============================
// DATABASE
// ==============================

// const DB = process.env.DATABASE.replace(
//     '<db_password>',
//     process.env.DATABASE_PASSWORD
// );

// mongoose.connect(DB)
//     .then(() => {
//         console.log("db connection successfully created");
//     })
//     .catch(err => {
//         console.log(err, "error");
//     });


// ==============================
// LOGIN
// ==============================
app.get("/", (req, res) => {
    res.json({
        message: "Ice Cream Management API is running"
    });
});
app.post(
    '/login',
    authController.login
);
// DONE
app.post('/categories',authController.protect,async(req,res)=>{
const categories=req.body;
console.log(req.body)
await dbCategories.insertMany(categories);
res.status(200).json({
    status:'success',
    message:'categories updated successfully'
})
})

// DONE
app.get('/categories',authController.protect, async(req,res)=>{
    console.log(req);
   const allCategories= await dbCategories.find();
   console.log(allCategories);
   res.status(200).json({
    status:'success',
    data:allCategories
   })
   
})

// DONE

app.post("/products",authController.protect, async (req, res) => {

    try {

        const products = req.body;
        console.log(req.body)
        // ==============================
        // VALIDATE
        // ==============================

        if (!Array.isArray(products) || products.length === 0) {

            return res.status(400).json({
                status: "error",
                message: "Products array is required"
            });

        }


        // ==============================
        // INSERT PRODUCTS FIRST
        // ==============================

        const insertedProducts =
            await dbProduct.insertMany(products);


        // ==============================
        // UPDATE CATEGORY COUNTS
        // ==============================

        for (const product of products) {

            const category = product.category;

            const company = product.company;


            console.log(
                "Category:",
                category,
                "Company:",
                company
            );


            // --------------------------
            // CATEGORY
            // --------------------------

            if (category) {

                const categoryResult =
                    await dbCategories.findOneAndUpdate(

                        {
                          name: category    
                        },

                        {
                            $inc: {
                                totalProducts: 1
                            }
                        },

                        {
                            new: true
                        }

                    );


                if (!categoryResult) {

                    console.log(
                        "Category not found:",
                        category
                    );

                }

            }


            // --------------------------
            // SUPPLIER
            // --------------------------

            if (company) {

                const supplierResult =
                    await dbSuppliers.findOneAndUpdate(

                        {
                            companyName: company
                        },

                        {
                            $inc: {
                                totalProducts: 1
                            }
                        },

                        {
                            new: true
                        }

                    );


                if (!supplierResult) {

                    console.log(
                        "Supplier not found:",
                        company
                    );

                }

            }

        }


        // ==============================
        // RESPONSE
        // ==============================

        return res.status(201).json({

            status: "success",

            message: "Products added successfully",

            data: insertedProducts

        });

    }
    catch (error) {

        console.error(
            "Error adding products:",
            error
        );

        return res.status(500).json({

            status: "error",

            message: "Failed to add products",

            error: error.message

        });

    }

});

// DONE
app.get('/products',authController.protect,async(req,res)=>{
 const products= await dbProduct.find().sort({id:1});
  res.status(200).json({
    status:'success',
    products
  }
  );
});

// Add salesman
app.post('/salesmen',authController.protect,async(req,res)=>{
  console.log(req.body);

  const newSaleman=await dbSalesman.insertOne(req.body);
  // const salesman=req.body
    res.send(newSaleman);
})      
// salesman delete
app.delete("/salesmen/:id",authController.protect,async (req, res) => {
    try {
        const id = Number(req.params.id);

        const salesman = await dbSalesman.findOneAndDelete({ id });

        if (!salesman) {
            return res.status(404).json({
                success: false,
                message: "Salesman not found"
            });
        }

        res.json({
            success: true,
            message: "Salesman deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// salesman update
app.put("/salesmen/:id",authController.protect, async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id:"+id,typeof(req.body.Adress))
        console.log(id)
        const salesman = await dbSalesman.findOneAndUpdate(
            { id: id },

            {
                name: req.body.name,
                phone: req.body.phone,
                address: req.body.Adress,
                status: req.body.status,
                route: req.body.route,
                outstandingBalance: req.body.outstandingBalance,
                cnic: req.body.cnic,
                email: req.body.email,
                dateOfBirth: req.body.dateOfBirth,
                photo: req.body.photo
            },

            {
                new: true,
                runValidators: true
            }
        );

        if (!salesman) {
            return res.status(404).json({
                success: false,
                message: "Salesman not found"
            });
        }

        res.json({
            success: true,
            message: "Salesman updated successfully",
            salesman: salesman
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// All Salesmen
app.get('/Allsalesmen',authController.protect,async(req,res)=>{
  const allSalesMen=await dbSalesman.find();
  const todayDeliveries=dbInvoice.find()


  const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);


const todayInvoicesCount = await dbInvoice.countDocuments({
    date: {
        $gte: startOfToday,
        $lt: startOfTomorrow
    }
})




  
res.status(200).json({
  status:'Success',
  data:allSalesMen,
  todayDeliveries:todayInvoicesCount
})
})

app.get("/oneSalesman",authController.protect,async(req,res)=>{


const id =
Number(req.query.id);



const salesman =
await dbSalesman.findOne({
    id:id
});



const invoices =
await dbInvoice.find({
    type:"salesman",
    partyId:id
}).sort({date:-1});



const summary =
invoices.map(inv=>({

invoiceId:inv.id,

invoiceNo:
"INV-"+inv.id,

date:inv.date,

totalItems:
inv.items.length,

amount:
inv.subtotal,

commission:
inv.commission,

cash:
inv.cash,

balance:
inv.balance,

   totalQuantity: inv.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    ),
}));



const stats={


outstandingBalance:
salesman.outStandingBalance || 0,


todayIssued:
invoices.reduce(
(sum,i)=>sum+i.subtotal,
0
),


totalInvoices:
invoices.length,


totalPayments:
invoices.reduce(
(sum,i)=>sum+i.cash,
0
)


};



res.json({

salesman,

stats,

summary

});


});

// add supplier
app.post("/suppliers",authController.protect, async(req,res)=>{

    try{


        const supplier = await dbSuppliers.insertOne(req.body);


        res.json(supplier);

    }
    catch(err){

        res.status(500).json({
            error:err.message
        });

    }

});

// suppliers list

app.get("/suppliers",authController.protect, async(req,res)=>{

    try{

        const suppliers = await dbSuppliers.find();

        // First day of next month
        
        res.json(suppliers);

    }
    catch(err){

        res.status(500).json({
            error:err.message
        });

    }

});


// =========================================================
// GET INVOICES
// Initial load + lightweight refresh
// =========================================================

app.get(
    "/invoices",
    authController.protect,
    async (req, res) => {

        try {

            const { limit, since } = req.query;

            // =================================================
            // BASE QUERY
            // =================================================
 
            const query = {};


            // =================================================
            // INCREMENTAL SYNC
            //
            // Example:
            // /invoices?since=2026-09-13T10:30:00.000Z
            // =================================================

            if (since) {

                const sinceDate =
                    new Date(since);


                if (
                    Number.isNaN(
                        sinceDate.getTime()
                    )
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid since date."
                    });

                }


                query.date = {
                    $gt: sinceDate
                };

            }


            // =================================================
            // QUERY DATABASE
            // =================================================

            let invoiceQuery =
                dbInvoice
                    .find(query)
                    .sort({
                        date: -1,
                        id: -1
                    });


            // =================================================
            // LIMIT
            //
            // No limit = all invoices
            // limit=10 = latest 10
            // =================================================

            if (limit) {

                const parsedLimit =
                    Number(limit);


                if (
                    !Number.isInteger(
                        parsedLimit
                    ) ||
                    parsedLimit < 1
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "limit must be a positive integer."
                    });

                }


                invoiceQuery =
                    invoiceQuery.limit(
                        parsedLimit
                    );

            }


            const invoices =
                await invoiceQuery;


            // =================================================
            // RESPONSE
            // =================================================

            return res.status(200).json({

                success: true,

                count:
                    invoices.length,

                invoices

            });


        } catch (error) {

            console.error(
                "Get invoices error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch invoices."

            });

        }

    }
);




//upload invoice
app.post("/invoices",authController.protect, async (req, res) => {

    try {

        const invoice = req.body;

        console.log("Invoice:", invoice);


        // =========================================
        // 1. Make sure invoice has products
        // =========================================

        if (!invoice.items || invoice.items.length === 0) {

            return res.status(400).json({
                message: "Invoice must contain products."
            });

        }


    // =========================================
// 2. CHECK STOCK / VALIDATE ITEMS
// =========================================

for (const item of invoice.items) {

    const product = await dbProduct.findOne({
        id: Number(item.productId)
    });

    if (!product) {

        return res.status(404).json({
            message: `Product ${item.productName} not found.`
        });

    }

    const quantity =
        Number(item.quantity) || 0;

    const returnedQuantity =
        Number(item.returnedQuantity || item.returnQuantity) || 0;


    // Quantity validation
    if (quantity < 1) {

        return res.status(400).json({
            message:
                `${item.productName}: quantity must be at least 1.`
        });

    }


    // Return validation
    if (returnedQuantity < 0) {

        return res.status(400).json({
            message:
                `${item.productName}: return quantity cannot be negative.`
        });

    }


    if (returnedQuantity > quantity) {

        return res.status(400).json({
            message:
                `${item.productName}: return quantity cannot be greater than quantity.`
        });

    }


    // =========================================
    // SALESMAN / ISSUE STOCK
    // =========================================

    if (invoice.type === "salesman") {

        const netQuantity =
            quantity - returnedQuantity;

        if (Number(product.qunatity) < netQuantity) {

            return res.status(400).json({
                message:
                    `${product.name}: only ${product.qunatity   } units available.`
            });

        }

    }

}

// =========================================
// 3. UPDATE PRODUCT STOCK
// =========================================

for (const item of invoice.items) {

    const quantity =
        Number(item.quantity) || 0;

    const returnedQuantity =
        Number(item.returnedQuantity || item.returnQuantity) || 0;


    // =========================================
    // SALESMAN / ISSUE STOCK
    // Decrease stock
    // =========================================

    if (invoice.type === "salesman") {

        const netQuantity =
            quantity - returnedQuantity;

        await dbProduct.updateOne(
            {
                id: Number(item.productId)
            },
            {
                $inc: {
                    qunatity: -netQuantity
                }
            }
        );

    }


    // =========================================
    // SUPPLIER / PURCHASE STOCK
    // Increase stock
    // =========================================

    else if (invoice.type === "supplier") {

        const netQuantity =
            quantity - returnedQuantity;

        await dbProduct.updateOne(
            {
                id: Number(item.productId)
            },
            {
                $inc: {
                    qunatity: netQuantity
                },
                $set:{
                    lastPurchase:new Date().toISOString()
                }
            }
        );

    }

}

        // =========================================
        // 4. SAVE INVOICE
        // =========================================
        console.log(invoice)
        await dbInvoice.insertOne(invoice);


        // =========================================
        // 5. UPDATE SALESMAN BALANCE
        // =========================================

        if (invoice.type === "salesman") {

            const updatedSalesman =
                await dbSalesman.findOneAndUpdate(

                    {
                        id: Number(invoice.partyId)
                    },

                    {
                        $set: {
                            outstandingBalance:
                                Number(invoice.balance)
                        }
                    },

                    {
                        new: true
                    }

                );



            console.log(
                "Updated salesman:",
                updatedSalesman
            );

        }

        if(invoice.type==='supplier'){
            const updatedSupplier=await dbSuppliers.findOneAndUpdate(
                     {
                        id: Number(invoice.partyId)
                    },

                    {
                        $set: {
                            outstandingBalance:
                                Number(invoice.balance)
                        }
                    },

                    {
                        new: true
                    }
            )

            await dbSuppliers.findOneAndUpdate({companyName:invoice.partyName},
                {
                    $inc:{
                        monthlyPurchases:+invoice.netTotal
                    }
                }
            )
        }

    
if (invoice.type === "supplier") {

    await dbSuppliers.findOneAndUpdate(
        { id: invoice.partyId },
        {
            $set: {
                lastPayment: {
                    amount: Number(invoice.netTotal || 0),
                    date: new Date(invoice.date).toISOString()
                }
            }
        }
    );

}




        // =========================================
        // 6. SUCCESS
        // =========================================

        res.status(201).json({

            success: true,

            message: "Invoice created successfully."

        });


    }
    catch (error) {

        console.error(
            "Invoice creation error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to create invoice."

        });

    }

});


// getting invoice when someone clicks on the table from frontend
app.get("/invoice/:id",authController.protect,async(req,res)=>{
const invoice =
await dbInvoice.findOne({
id:Number(req.params.id)
});


if(!invoice){

return res.status(404)
.json({
message:"Invoice not found"
});

}


res.json(invoice);


});






// ================= UPDATE CATEGORY =================

app.put("/categories/:id",authController.protect, async (req, res) => {

    try {

        const id = Number(req.params.id);

        const {
            name,
            Description
        } = req.body;


        if (!name || name.trim() === "") {

            return res.status(400).json({

                success: false,

                message: "Category name is required"

            });

        }


        const updatedCategory =
            await dbCategories.findOneAndUpdate(

                { id: id },

                {
                    name: name.trim(),
                    Description: Description || ""
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!updatedCategory) {

            return res.status(404).json({

                success: false,

                message: "Category not found"

            });

        }


        res.status(200).json({

            success: true,

            message: "Category updated successfully",

            data: updatedCategory

            });

        }
        catch (error) {

            console.error("Update Error:", error);


            // Duplicate category name
            if (error.code === 11000) {

                return res.status(400).json({

                    success: false,

                    message: "Category name already exists"

                });

            }


            res.status(500).json({

                success: false,

                message: "Failed to update category",

                error: error.message

            });

        }

    });



    // ================= DELETE CATEGORY =================

    app.delete("/categories/:id",authController.protect,async (req, res) => {

        try {

            const id = Number(req.params.id);


            const deletedCategory =
                await dbCategories.findOneAndDelete({

                    id: id

                });


            if (!deletedCategory) {

                return res.status(404).json({

                    success: false,

                    message: "Category not found"

                });

            }

            
            res.status(200).json({

                success: true,

                message: "Category deleted successfully",

                data: deletedCategory

            });

        }
        catch (error) {

            console.error("Delete Error:", error);


            res.status(500).json({

                success: false,

                message: "Failed to delete category",

                error: error.message

            });

        }

    });


// ===========================================================
// UPDATE PRODUCT
// ===========================================================

app.put("/products/:id",authController.protect,async (req, res) => {

    try {

        const id = Number(req.params.id);

        const {
            name,
            company,
            purchasePrice,
            salePrice,
            category,
            description
        } = req.body;


        if (!name || name.trim() === "") {

            return res.status(400).json({
                status: "error",
                message: "Product name is required"
            });

        }

      const  findProduct=await dbProduct.findOne({
        id:id
      })
if(findProduct.category!==category){
    await dbCategories.findOneAndUpdate({name:findProduct.category},{
        $inc:{
            totalProducts:-1
        }
    })
await dbCategories.findOneAndUpdate({
   name:category
},
{
    $inc:{
        totalProducts:+1
    }
}
)



}

if(findProduct.company!==company){
    await dbSuppliers.findOneAndUpdate({name:company},{
        $inc:{
            totalProducts:+1
        }
    })
    await dbSuppliers.findOneAndUpdate({
        name:findProduct.company
    },
    {
        $inc:{
            totalProducts:-1
        }
    }
)
}
        const updatedProduct =
            await dbProduct.findOneAndUpdate(

                { id: id },

                {
                    name: name.trim(),
                    company: company,
                    purchasePrice: Number(purchasePrice),
                    salePrice: Number(salePrice),
                    category: category,
                    description: description || ""
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!updatedProduct) {

            return res.status(404).json({
                status: "error",
                message: "Product not found"
            });

        }


        res.status(200).json({

            status: "success",

            message: "Product updated successfully",

            data: updatedProduct

        });

    }
    catch (error) {

        console.error("Update Product Error:", error);

        res.status(500).json({

            status: "error",

            message: "Failed to update product",

            error: error.message

        });

    }

});



// ===========================================================
// DELETE PRODUCT
// ===========================================================

app.delete("/products/:id",authController.protect,async (req, res) => {

    try {

        const id = Number(req.params.id);


        const deletedProduct =
            await dbProduct.findOneAndDelete({
                id: id
            });


        if (!deletedProduct) {

            return res.status(404).json({

                status: "error",

                message: "Product not found"

            });


        }

         
 const find=deletedProduct.category;
 const updated =await dbCategories.updateMany({name:find},{
    
        $inc:{
        totalProducts:-1
    }
 })
        res.status(200).json({

            status: "success",

            message: "Product deleted successfully",

            data: deletedProduct

        });

    }
    catch (error) {

        console.error("Delete Product Error:", error);

        res.status(500).json({

            status: "error",

            message: "Failed to delete product",

            error: error.message

        });

    }

});

// for total today purchase,today issued and last payment
app.get("/summary",authController.protect,async(req,res)=>{
    console.log(req.query.id)
const id=Number(req.query.id);
console.log(typeof(req.query.id))
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
const todayInvoices=await dbInvoice.find({
   partyId:id,
   date:{
    $gte:startOfToday,
    $lte:startOfTomorrow
   }
}).
sort({ date: -1 });
let todayIssued=0;//total purchase made by salesman from the company
if(todayInvoices.length === 0){
    return res.status(404).json({
        success:false,
        message:"no invoices for today",
        todayIssued:todayIssued,
          todayInvoices: [],
    todayInvoiceLength: 0
    })
}
console.log(todayInvoices)
//////Summary calculation

todayInvoices.forEach((invoice)=>{
   
 todayIssued= invoice.netTotal+todayIssued
})
 res.status(200).json({status:"success",
    todayInvoices:todayInvoices,
    todayIssued:todayIssued,
    todayInvoiceLength:todayInvoices.length
});

})

app.put(
    "/invoice/:id/update-last",
    authController.protect,
    async (req, res) => {

        try {

            const invoiceId = Number(req.params.id);

            const {
                items,
                cash
            } = req.body;


            // ========================================
            // 1. FIND INVOICE
            // ========================================

            const invoice = await dbInvoice.findOne({
                id: invoiceId
            });

            if (!invoice) {

                return res.status(404).json({
                    message: "Invoice not found"
                });

            }


            // ========================================
            // 2. ONLY SALESMAN / SUPPLIER INVOICES
            // ========================================

            if (
                invoice.type !== "salesman" &&
                invoice.type !== "supplier"
            ) {

                return res.status(400).json({
                    message:
                        "Only salesman or supplier invoices can be edited"
                });

            }


            // ========================================
            // 3. FIND LATEST INVOICE FOR THIS PARTY
            // ========================================

            const latestInvoice = await dbInvoice
                .findOne({
                    type: invoice.type,
                    partyId: Number(invoice.partyId)
                })
                .sort({
                    date: -1,
                    id: -1
                });


            if (!latestInvoice) {

                return res.status(404).json({
                    message: "Latest invoice not found"
                });

            }


            // ========================================
            // 4. SECURITY CHECK
            // ONLY LATEST INVOICE CAN BE EDITED
            // ========================================

            if (
                Number(latestInvoice.id) !==
                Number(invoice.id)
            ) {

                return res.status(400).json({
                    message:
                        "Only the most recent invoice can be edited"
                });

            }


            // ========================================
            // 5. CASH
            // ========================================

            const newCash = Math.max(
                Number(cash || 0),
                0
            );


            // ========================================
            // 6. RECALCULATE ITEMS
            // ========================================

            let subtotal = 0;

            let nonCommissionableAmount = 0;

            const oldItems = Array.isArray(invoice.items)
                ? invoice.items
                : [];

            const submittedItems =
                Array.isArray(items)
                    ? items
                    : [];


            const updatedItems = oldItems.map(
                (oldItem) => {

                    // Find edited item
                    const submittedItem =
                        submittedItems.find(
                            item =>
                                Number(item.productId) ===
                                Number(oldItem.productId)
                        );


                    // --------------------------------
                    // RETURN QUANTITY
                    // --------------------------------

                    let returnQuantity =
                        Number(
                            submittedItem?.returnQuantity ??
                            oldItem.returnQuantity ??
                            0
                        );


                    const quantity =
                        Number(oldItem.quantity || 0);


                    // Cannot be negative
                    if (returnQuantity < 0) {
                        returnQuantity = 0;
                    }


                    // Cannot exceed purchased quantity
                    if (returnQuantity > quantity) {
                        returnQuantity = quantity;
                    }


                    // --------------------------------
                    // NET QUANTITY
                    // --------------------------------

                    const netQuantity =
                        quantity -
                        returnQuantity;


                    // --------------------------------
                    // AMOUNT
                    // --------------------------------

                    const price =
                        Number(oldItem.price || 0);

                    const amount =
                        netQuantity *
                        price;


                    subtotal += amount;


                    // --------------------------------
                    // COMMISSIONABLE
                    // --------------------------------

                    if (
                        oldItem.commissionApplicable === "no"
                    ) {

                        nonCommissionableAmount +=
                            amount;

                    }


                    // --------------------------------
                    // RETURN UPDATED ITEM
                    // --------------------------------

                    return {

                        productId:
                            oldItem.productId,

                        productName:
                            oldItem.productName,

                        quantity:
                            quantity,

                        price:
                            price,

                        returnQuantity:
                            returnQuantity,

                        amount:
                            amount,

                        commissionApplicable:
                            oldItem.commissionApplicable

                    };

                }
            );


            // ========================================
            // 7. COMMISSION
            // ========================================

            const commissionableAmount =
                Math.max(
                    subtotal -
                    nonCommissionableAmount,
                    0
                );


            /*
             * Keeping your existing calculation:
             * dynamicComission commission.
             */
            const commission =
                commissionableAmount *Number(invoice.dynamicComission);


            // ========================================
            // 8. DISCOUNT
            // ========================================

            const discount =
                Number(invoice.discount || 0);


            // ========================================
            // 9. NET TOTAL
            // ========================================

            const netTotal =
                subtotal -
                commission -
                discount;


            // ========================================
            // 10. CURRENT BILL
            // ========================================

            const currentBill =
                netTotal -
                newCash;


            // ========================================
            // 11. ARREARS
            // ========================================

            const arrears =
                Number(invoice.arrears || 0);


            // ========================================
            // 12. BALANCE
            // ========================================

            const balance =
                currentBill +
                arrears;


            // ========================================
            // 13. UPDATE INVOICE
            // ========================================

            invoice.items =
                updatedItems;

            invoice.subtotal =
                subtotal;

            invoice.commission =
                commission;

            invoice.discount =
                discount;

            invoice.netTotal =
                netTotal;

            invoice.cash =
                newCash;

            invoice.balance =
                balance;

            invoice.arrears =
                arrears;


            await invoice.save();


            // ========================================
            // 14. UPDATE STOCK
            //
            // NEW RETURN - OLD RETURN
            //
            // Example:
            // oldReturn = 2
            // newReturn = 5
            // stock += 3
            //
            // oldReturn = 5
            // newReturn = 2
            // stock -= 3
            // ========================================

            for (const item of invoice.items) {

                const product =
                    await dbProduct.findOne({
                        id: item.productId
                    });


                if (!product) {

                    console.log(
                        "Product not found:",
                        item.productId
                    );

                    continue;
                }


                const oldReturn =
                    Number(product.lastReturn || 0);

                const newReturn =
                    Number(item.returnQuantity || 0);


                let stockDifference;
                console.log(invoice.type)
                if(invoice.type=="supplier"){
                      stockDifference = oldReturn - newReturn;
                }else{
                      stockDifference =
                    newReturn -
                    oldReturn;
                }

                if (stockDifference !== 0) {

                    await dbProduct.findOneAndUpdate(
                        {
                            id: item.productId
                        },
                        {
                            $inc: {
                                qunatity:
                                    stockDifference
                            },

                            $set: {
                                lastReturn:
                                    newReturn
                            }
                        }
                    );

                } else {

                    /*
                     * Still keep lastReturn synchronized.
                     */
                    await dbProduct.findOneAndUpdate(
                        {
                            id: item.productId
                        },
                        {
                            $set: {
                                lastReturn:
                                    newReturn
                            }
                        }
                    );

                }

            }


            // ========================================
            // 15. UPDATE PARTY BALANCE
            // ========================================

            if (
                invoice.type === "salesman"
            ) {

                const updatedSalesman =
                    await dbSalesman.findOneAndUpdate(

                        {
                            id:
                                Number(invoice.partyId)
                        },

                        {
                            $set: {
                                outstandingBalance:
                                    Number(invoice.balance)
                            }
                        },

                        {
                            new: true
                        }

                    );


                console.log(
                    "Updated salesman:",
                    updatedSalesman
                );

            }


            if (
                invoice.type === "supplier"
            ) {

                const updatedSupplier =
                    await dbSuppliers.findOneAndUpdate(

                        {
                            id:
                                Number(invoice.partyId)
                        },

                        {
                            $set: {
                                outstandingBalance:
                                    Number(invoice.balance)
                            }
                        },

                        {
                            new: true
                        }

                    );


                console.log(
                    "Updated supplier:",
                    updatedSupplier
                );
                 console.log("invoice:",invoice.dynamicComission)
        console.log("latestInvoice",latestInvoice.dynamicComission);

            }


            // ========================================
            // 16. RESPONSE
            // ========================================

            return res.json({

                message:
                    "Invoice updated successfully",

                invoice

            });


        } catch (error) {

            console.error(
                "Update invoice error:",
                error
            );

            return res.status(500).json({

                message:
                    "Unable to update invoice",

                error:
                    error.message

            });

        }
       

    }
);
app.get("/salesman/:salesmanId/latest-invoice", authController.protect, async (req, res) => {
    try {
        const partyId = Number(req.params.salesmanId);
        const type = req.query.type;

        if (!["salesman", "supplier"].includes(type)) {
            return res.status(400).json({
                message: "Invalid party type"
            });
        }

        const latestInvoice = await dbInvoice
            .findOne({
                type: type,
                partyId: partyId
            })
            .sort({
                date: -1,
                id: -1
            });

        if (!latestInvoice) {
            return res.status(404).json({
                message: `No invoice found for this ${type}`
            });
        }

        res.json(latestInvoice);

    } catch (error) {
        console.error("Latest invoice error:", error);

        res.status(500).json({
            message: "Unable to fetch latest invoice"
        });
    }
});

app.get("/suppliers/recent-invoices",authController.protect,async (req, res) => {

    try {
        console.log(req.query.id);
       
        const invoices = await dbInvoice.find({
            type: "supplier",
            partyId: Number(req.query.id)
        })
        .sort({ date: -1 })
        .limit(3);
         const products=await dbProduct.find({
            company:invoices[0].partyName
         }).sort({id:1}).limit(10);
console.log(products)
        res.json({
            status: "success",
            invoices,
            products
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            status: "error",
            message: "Failed to fetch invoices"
        });

    }

});


// ================= UPDATE SUPPLIER =================

app.patch("/suppliers/:id",authController.protect,async (req, res) => {

    try {

        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID"
            });
        }


        // ----------------------------------------
        // Only allow these fields to be changed
        // ----------------------------------------

        const allowedFields = [
            "companyName",
            "contactPerson",
            "phone",
            "whatsapp",
            "email",
            "city",
            "address",
            "status",
            "logo"
        ];


        const updateData = {};


        for (const field of allowedFields) {

            if (req.body[field] !== undefined) {

                updateData[field] = req.body[field];

            }

        }


        // ----------------------------------------
        // Make sure something was sent
        // ----------------------------------------

        if (Object.keys(updateData).length === 0) {

            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            });

        }


        // ----------------------------------------
        // Basic validation
        // ----------------------------------------

        if (
            updateData.companyName !== undefined &&
            updateData.companyName.trim() === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "Company name cannot be empty"
            });

        }


        if (updateData.email !== undefined) {

            updateData.email =
                updateData.email.trim().toLowerCase();

        }


        // ----------------------------------------
        // Find and update supplier
        // ----------------------------------------

        const updatedSupplier =
            await dbSuppliers.findOneAndUpdate(

                { id: id },

                {
                    $set: updateData
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        // ----------------------------------------
        // Supplier not found
        // ----------------------------------------

        if (!updatedSupplier) {

            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });

        }


        // ----------------------------------------
        // Success
        // ----------------------------------------

        res.status(200).json({

            success: true,

            message: "Supplier updated successfully",

            data: updatedSupplier

        });

    }
    catch (error) {

        console.error(
            "Update supplier error:",
            error
        );


        // Duplicate email
        if (error.code === 11000) {

            return res.status(400).json({

                success: false,

                message:
                    "Email already belongs to another supplier"

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to update supplier",

            error:
                error.message

        });

    }

});

// ===========================================================
// DELETE SUPPLIER
// ===========================================================

app.delete("/suppliers/:id",authController.protect,async (req, res) => {

    try {

        const id = Number(req.params.id);


        if (Number.isNaN(id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid supplier ID"

            });

        }


        // ---------------------------------------
        // Check supplier exists
        // ---------------------------------------

        const supplier =
            await dbSuppliers.findOne({ id });


        if (!supplier) {

            return res.status(404).json({

                success: false,

                message: "Supplier not found"

            });

        }


        // ---------------------------------------
        // Delete supplier
        // ---------------------------------------

        const deletedSupplier =
            await dbSuppliers.findOneAndDelete({ id });


        res.status(200).json({

            success: true,

            message: "Supplier deleted successfully",

            data: deletedSupplier

        });

    }
    catch (error) {

        console.error(
            "Delete supplier error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to delete supplier",

            error: error.message

        });

    }

});


// ===========================================================
// GET SINGLE SUPPLIER
// ===========================================================

app.get("/suppliers/:id",authController.protect, async (req,res) => {

    try {
        console.log(req.cookies.token)

        const id = Number(req.params.id);

        if (Number.isNaN(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID"
            });

        }


        const supplier =
            await dbSuppliers.findOne({
                id: id
            });


        if (!supplier) {

            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });

        }


        res.status(200).json({

            success: true,

            data: supplier

        });

    }
    catch (error) {

        console.error(
            "Get supplier error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch supplier",

            error:
                error.message

        });

    }

});


// ===========================================================
// GET SUPPLIER INVOICES
// ===========================================================

app.get("/suppliers/:id/invoices",authController.protect,async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (Number.isNaN(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID"
            });

        }


        const invoices =
            await dbInvoice
                .find({
                    type: "supplier",
                    partyId: id
                })
                .sort({
                    date: -1
                });


        res.json({

            success: true,

            invoices

        });

    }
    catch (error) {

        console.error(
            "Supplier invoices error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch supplier invoices",

            error:
                error.message

        });

    }

});

// ===========================================================
// GET SUPPLIER PRODUCTS
// ===========================================================

app.get("/suppliers/:id/products",authController.protect, async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (Number.isNaN(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID"
            });

        }


        const supplier =
            await dbSuppliers.findOne({
                id: id
            });


        if (!supplier) {

            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });

        }


        const products =
            await dbProduct.find({
                company:
                    supplier.companyName
            })
            .sort({
                id: 1
            });


        res.json({

            success: true,

            products

        });

    }
    catch (error) {

        console.error(
            "Supplier products error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch supplier products",

            error:
                error.message

        });

    }

});

app.get("/dashboard",authController.protect, async (req, res) => {
    try {

        // ==========================================
        // DATE RANGE
        // ==========================================

        const now = new Date();

        const startOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const endOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
        );


        // ==========================================
        // 1. PRODUCTS
        // ==========================================

        const products = await dbProduct.find()
            .select(
                "id name company qunatity salePrice purchasePrice category"
            )
            .lean();


        // ==========================================
        // 2. SALESMEN
        // ==========================================

        const totalSalesmen = await dbSalesman.countDocuments({
            status: true
        });


        // ==========================================
        // 3. TOTAL STOCK
        // ==========================================

        const stockResult = await dbProduct.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: {
                        $sum: {
                            $ifNull: ["$qunatity", 0]
                        }
                    }
                }
            }
        ]);

        const totalStocks =
            stockResult[0]?.totalStock || 0;


        // ==========================================
        // 4. STOCK OVERVIEW
        // ==========================================

        const stockOverview = products.map(product => {

            const stock = Number(product.qunatity) || 0;

            const salePrice = Number(product.salePrice) || 0;

            return {
                id: product.id,
                productName: product.name,
                brand: product.company,
                stock: stock,
                salePrice: salePrice,
                totalValue: stock * salePrice
            };

        });


        // ==========================================
        // 5. TODAY'S INVOICES
        // ==========================================

        const todayInvoices = await dbInvoice.find({
            type: "salesman",
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).lean();


        // ==========================================
        // 6. TODAY ISSUED
        // ==========================================

        const todayIssued = todayInvoices.length;


        // ==========================================
        // 7. TODAY SALES VALUE
        // ==========================================

        const todaySalesValue = todayInvoices.reduce(
            (sum, invoice) => {
                return sum + (Number(invoice.netTotal) || 0);
            },
            0
        );


        // ==========================================
        // 8. RECENT INVOICES
        // ==========================================

        const recentInvoiceDocs = await dbInvoice.find()
            .sort({ date: -1 })
            .limit(5)
            .lean();


        const recentInvoices = recentInvoiceDocs.map(invoice => {

            return {
                id: invoice._id,

                invoiceNo: invoice.id,

                date: invoice.date,

                salesman:
                  invoice.partyName,
                       

                total: Number(invoice.netTotal) || 0
            };

        });


        // ==========================================
        // 9. TOP SALESMEN
        // ==========================================

        const topSalesmen = await dbInvoice.aggregate([

            {
                $match: {
                    type: "salesman"
                }
            },

            {
                $group: {
                    _id: "$partyId",

                    name: {
                        $first: "$partyName"
                    },

                    totalSales: {
                        $sum: {
                            $ifNull: ["$netTotal", 0]
                        }
                    },

                    totalInvoices: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    totalSales: -1
                }
            },

            {
                $limit: 5
            }

        ]);


        // ==========================================
        // 10. FIND MAX SALES
        // ==========================================

        const maxSales =
            topSalesmen.length > 0
                ? topSalesmen[0].totalSales
                : 0;


        const formattedTopSalesmen =
            topSalesmen.map(salesman => {

                return {
                    id: salesman._id,
                    name: salesman.name || "-",
                    totalSales: salesman.totalSales || 0,
                    totalInvoices: salesman.totalInvoices || 0,

                    percentage:
                        maxSales > 0
                            ? Math.round(
                                (salesman.totalSales / maxSales) * 100
                            )
                            : 0
                };

            });


        // ==========================================
        // 11. RESPONSE
        // ==========================================

        res.json({

            success: true,

            stats: {
                totalProducts: products.length,
                totalStocks,
                totalSalesmen,
                todayIssued,
                todaySalesValue
            },

            stockOverview,

            recentInvoices,

            topSalesmen:
                formattedTopSalesmen

        });


    } catch (error) {

        console.error("Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard",
            error: error.message
        });

    }
});


app.get('/getMe',authController.protect,authController.GetMe
)
// app.get('*',(req,res)=>{
//     res.json({
//         path:"path not found"
//     })
// })

   if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
    module.exports=app