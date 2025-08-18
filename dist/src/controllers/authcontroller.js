"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = __importDefault(require("../services/authService"));
const authController = {
    registerUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { name, email, password, role, walletAddress } = req.body;
            const issuerAddress = (_a = req.user) === null || _a === void 0 ? void 0 : _a.walletAddress;
            yield authService_1.default.registerUser({ name, email, password, issuerAddress, role, walletAddress });
            res.status(201).json({
                success: true,
                message: "User registered successfully",
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "User already exists" || error.message === "Issuer not found, cannot register user") {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
            }
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }),
    registerInstitution: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { institutionName, email, password, address } = req.body;
            yield authService_1.default.registerInstitution({ institutionName, email, password, address });
            res.status(201).json({
                success: true,
                message: "Institution registered successfully",
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Institution already exists") {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
            }
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            console.log("otw");
            const loginResult = yield authService_1.default.loginUser({ email, password });
            res.cookie("refreshToken", loginResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    accessToken: loginResult.accessToken,
                    refreshToken: loginResult.refreshToken,
                },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "User not found") {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                if (error.message === "Invalid credentials") {
                    res.status(401).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
            }
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }),
    refreshToken: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { refreshToken } = req.cookies;
            const accessToken = yield authService_1.default.refreshAccessToken(refreshToken);
            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: { accessToken },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "No refresh token provided") {
                    res.status(401).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
            }
            console.error("Token refresh error:", error);
            res.status(403).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
        }
    }),
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Assuming you have user ID from middleware
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (userId) {
                yield authService_1.default.logout(userId);
            }
            res.clearCookie("refreshToken");
            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        }
        catch (error) {
            console.error("Logout error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }),
};
exports.default = authController;
