const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authMiddleware = async(req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if(authHeader || authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token && req.cookies?.access_token) {
            token = req.cookies.access_token;
        }

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({id: decoded.id});
        if(!user || !user.is_active){
            return res.status(403).json({
                status: "error",
                message: "Forbidden"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            status: "error",
            message: "Invalid or expired token"
        });
    }
}