"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload, type) => {
    try {
        const secret = type === "access" ? (process.env.ACCESS_TOKEN_SECRET || "ASDFGHJKL0987654321") : (process.env.REFRESH_TOKEN_SECRET || "KJHGFDSA0987654321");
        const expiresIn = type === "access" ? (process.env.ACCESS_TOKEN_EXPIRY || "15m") : (process.env.REFRESH_TOKEN_EXPIRY || "7d");
        return jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn,
        });
    }
    catch (error) {
        console.error("Error generating token:", error);
        throw new Error("Token generation failed");
    }
};
exports.generateToken = generateToken;
const verifyToken = (token, type) => {
    try {
        const secret = type === "access" ? (process.env.ACCESS_TOKEN_SECRET || "ASDFGHJKL0987654321") : (process.env.REFRESH_TOKEN_SECRET || "KJHGFDSA0987654321");
        const decode = jsonwebtoken_1.default.verify(token, secret);
        return {
            id: decode.id,
            email: decode.email,
            owner: decode.institutionName,
            role: decode.role,
            walletAddress: decode.walletAddress,
        };
    }
    catch (error) {
        throw new Error("Token verification failed");
    }
};
exports.verifyToken = verifyToken;
