"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const InstitutionSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    institutionName: {
        type: String,
        required: true,
    },
    certificates: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Certificate",
            required: false,
        },
    ],
    sertifImage: {
        type: String,
        required: false,
    },
    refreshToken: {
        type: String,
        required: false,
    },
});
const Institution = mongoose_1.default.model("Insitution", InstitutionSchema);
exports.default = Institution;
