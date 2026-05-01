exports.roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        if(req.user.role !== requiredRole){
            return res.status(403).json({
                status: "error",
                message: "Forbidden: insufficient permissions"
            });
        }
        next();
    }
}