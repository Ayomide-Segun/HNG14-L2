const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const route = require('./routes/route');
const userRoutes = require("./routes/userRoutes");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(express.json());
app.use(cors({
    origin: "*"
}))


app.use(cookieParser());

app.use((req, res, next) => {
    const start = Date.now();
    
    res.on("finish", () => {
        const duration = Date.now() - start;
        
        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });
    
    next();
});

const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        status: "error",
        message: "Too many requests"
    }
});

const apiLimiter =rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        status: "error",
        message: "Too many requests"
    }
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);  

app.use((req, res, next) => {
    const start = Date.now();

res.on("finish", () => {
    const duration = Date.now() - start;
        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });
    next();
});

app.use("/api/auth", userRoutes);
app.use("/api", route);
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

        const { PORT } = process.env;
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

startServer();
