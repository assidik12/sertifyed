"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateCertificate = exports.validateLogin = exports.validateInstitutionRegister = exports.validateUserRegister = void 0;
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
const createCertificateSchema = joi_1.default.object({
    studentName: joi_1.default.string().min(2).max(100).required(),
    studentEmail: joi_1.default.string().email().required(),
    courseTitle: joi_1.default.string().min(2).max(100).required(),
    issuerName: joi_1.default.string().min(2).max(100).required(),
    recipientWallet: joi_1.default.string().required(),
    certificateDescription: joi_1.default.string().max(500).optional(),
    grade: joi_1.default.string().max(10).optional(),
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
const validateCreateCertificate = (req, res, next) => {
    const { error } = createCertificateSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            message: "Missing required fields",
            errors: error.details.map((detail) => detail.message),
        });
        return;
    }
    next();
};
exports.validateCreateCertificate = validateCreateCertificate;
