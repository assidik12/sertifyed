"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateInstitutionRegister = exports.validateUserRegister = void 0;
const joi_1 = __importDefault(require("joi"));
const registerUserSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    walletAddress: joi_1.default.string().required(),
    password: joi_1.default.string().min(6).required(),
    role: joi_1.default.string().optional(),
});
const registerInstitutionSchema = joi_1.default.object({
    institutionName: joi_1.default.string().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    address: joi_1.default.string().required(),
    password: joi_1.default.string().min(6).required(),
    mitra: joi_1.default.string().optional(),
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
const validateUserRegister = (req, res, next) => {
    const { error } = registerUserSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.details.map((detail) => detail.message),
        });
        return;
    }
    next();
};
exports.validateUserRegister = validateUserRegister;
const validateInstitutionRegister = (req, res, next) => {
    const { error } = registerInstitutionSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.details.map((detail) => detail.message),
        });
        return;
    }
    next();
};
exports.validateInstitutionRegister = validateInstitutionRegister;
const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.details.map((detail) => detail.message),
        });
        return;
    }
    next();
};
exports.validateLogin = validateLogin;
