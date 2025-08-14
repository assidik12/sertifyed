"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_config_1 = require("../config/multer.config");
const fileController_1 = require("../controllers/fileController");
const uploadRoute = (0, express_1.Router)();
// Upload single
uploadRoute.post("/single", multer_config_1.upload.single("image"), fileController_1.uploadSingleFile);
// Upload multiple
// uploadRoute.post("/multiple", upload.array("images", 5), uploadMultipleFiles);
exports.default = uploadRoute;
