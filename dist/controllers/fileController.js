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
exports.uploadMultipleFiles = exports.uploadSingleFile = void 0;
const File_1 = require("../models/File");
const Insitution_1 = __importDefault(require("../models/Insitution"));
const uploadSingleFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mitraId = req.body.mitraId;
        if (!mitraId) {
            return res.status(400).json({ message: "Mitra ID is required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const file = yield File_1.FileModel.create({
            filename: req.file.filename,
            path: `uploads/${req.file.filename}`,
            mimetype: req.file.mimetype,
            size: req.file.size,
        });
        const mitra = yield Insitution_1.default.findByIdAndUpdate(mitraId, {
            sertifImage: file.path,
        }, { new: true });
        res.status(201).json({
            message: "file uploaded successfully",
            file,
            mitra,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                message: "Error uploading file",
                error: error.message,
            });
        }
    }
});
exports.uploadSingleFile = uploadSingleFile;
const uploadMultipleFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
            return res.status(400).json({ message: "Tidak ada file yang diupload!" });
        }
        const files = yield File_1.FileModel.insertMany(req.files.map((file) => ({
            filename: file.filename,
            path: `/uploads/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
        })));
        res.status(200).json({
            message: "Upload multiple berhasil!",
            files,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan", error });
    }
});
exports.uploadMultipleFiles = uploadMultipleFiles;
