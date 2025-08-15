"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwtUtils_1 = require("../utils/jwtUtils");
const protectRoute = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header is missing" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token is missing" });
    }
    try {
        const payload = (0, jwtUtils_1.verifyToken)(token, "access");
        req.user = {
            id: payload.id,
            email: payload.email,
            institutionName: payload.owner,
            walletAddress: payload.walletAddress,
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
exports.default = protectRoute;
