"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cloudinary_config_1 = require("../config/cloudinary.config");
const certificateController_1 = require("../controllers/certificateController");
const protectRoute_1 = __importDefault(require("../middleware/protectRoute"));
const certificateRoute = (0, express_1.Router)();
// get certificate from recipient
certificateRoute.get("/user", certificateController_1.getCertificateByOwner);
// get verification data by id
certificateRoute.get("/:tokenId", certificateController_1.getVerificationDataById);
// create certificate from institution
certificateRoute.post("/", protectRoute_1.default, cloudinary_config_1.uploadPdf.single("certificate"), certificateController_1.uploadCertificate);
exports.default = certificateRoute;
