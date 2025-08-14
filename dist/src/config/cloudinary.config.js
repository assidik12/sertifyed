"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPdf = void 0;
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
// Konfigurasi koneksi ke akun Cloudinary Anda
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Konfigurasi storage engine untuk multer
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: "sertifyed", // Nama folder di Cloudinary untuk menyimpan file
        allowed_formats: ["pdf"], // Hanya izinkan format PDF
        format: "pdf",
        // Anda bisa menambahkan parameter lain di sini jika perlu
        // public_id: (req, file) => 'custom_file_name', // contoh untuk nama file custom
    }, // 'any' diperlukan karena tipe 'params' di library mungkin tidak lengkap
});
// Inisialisasi Multer dengan storage engine Cloudinary
exports.uploadPdf = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Batas ukuran file 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else {
            cb(new Error("File yang diupload harus dalam format PDF."));
        }
    },
});
