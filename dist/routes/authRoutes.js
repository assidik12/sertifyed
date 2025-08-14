"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authcontroller_1 = __importDefault(require("../controllers/authcontroller"));
const validation_1 = require("../middleware/validation");
const express_1 = require("express");
const protectRoute_1 = __importDefault(require("../middleware/protectRoute"));
const authRoute = (0, express_1.Router)();
authRoute.post("/register/user", validation_1.validateUserRegister, authcontroller_1.default.registerUser);
authRoute.post("/login", validation_1.validateLogin, authcontroller_1.default.login);
authRoute.get("/refresh-token", authcontroller_1.default.refreshToken);
authRoute.post("/logout", protectRoute_1.default, authcontroller_1.default.logout);
// register institution
authRoute.post("/register/institution", validation_1.validateInstitutionRegister, authcontroller_1.default.registerInstitution);
exports.default = authRoute;
