const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const route = require('./route');
const cors = require('cors');

const app = express();
console.log("SERVER FILE IS RUNNING");

app.use(express.json());
app.use(cors({
    origin: "*"
}))

app.use("/api", route);


const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
        
        const {PORT} = process.env;
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

startServer();
