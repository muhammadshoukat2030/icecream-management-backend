const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {

    // Already connected
    if (
        isConnected &&
        mongoose.connection.readyState === 1
    ) {
        return;
    }

    const DB = process.env.DATABASE.replace(
        "<db_password>",
        process.env.DATABASE_PASSWORD
    );

    try {

        await mongoose.connect(DB);

        isConnected = true;

        console.log("MongoDB connected successfully");

    } catch (error) {

        isConnected = false;

        console.error(
            "MongoDB connection error:",
            error.message
        );

        throw error;
    }
};

module.exports = connectDB;