"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Certificate.ts
const mongoose_1 = __importStar(require("mongoose"));
// Definisikan Skema Mongoose
const CertificateSchema = new mongoose_1.Schema({
    // Data utama sertifikat
    studentName: {
        type: String,
        required: [true, "Nama siswa wajib diisi."],
    },
    courseTitle: {
        type: String,
        required: [true, "Judul kursus/sertifikat wajib diisi."],
    },
    issueDate: {
        type: Date,
        required: [true, "Tanggal penerbitan wajib diisi."],
    },
    issuerName: {
        type: String,
        required: [true, "Nama penerbit wajib diisi."],
    },
    recipientWallet: {
        type: String,
        required: [true, "Alamat wallet penerima wajib diisi."],
    },
    certificateDescription: {
        type: String,
        required: false, // Opsional
    },
    grade: {
        type: String,
        required: false, // Opsional
    },
    fileUploader: {
        type: String,
        required: [true, "File uploader wajib diisi."],
    },
    // Data dari/untuk blockchain
    tokenId: {
        type: Number,
        required: [true, "Token ID dari blockchain wajib ada."],
        unique: true,
        index: true, // Tambahkan index untuk pencarian cepat
    },
    transactionHash: {
        type: String,
        required: [true, "Hash transaksi dari blockchain wajib ada."],
        unique: true,
    },
    dataHash: {
        type: String,
        required: [true, "Hash data untuk verifikasi wajib ada."],
    },
    // Relasi ke model lain
    organization: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
}, {
    // Opsi skema
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
});
// Membuat model dari skema dan mengekspornya
const CertificateModel = mongoose_1.default.model("Certificate", CertificateSchema);
exports.default = CertificateModel;
