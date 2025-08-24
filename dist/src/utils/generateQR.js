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
const qrcode_1 = __importDefault(require("qrcode"));
/**
 * Membuat QR Code yang mengarah ke URL dengan data sertifikat tersemat.
 * Data akan diubah menjadi string JSON, di-encode ke Base64, dan ditambahkan sebagai parameter URL.
 * @param data - Objek yang berisi data penting sertifikat.
 * @param baseUrl - URL halaman web yang akan menampilkan data (misal: 'https://domain-anda.com/tampilan-sertifikat.html').
 * @returns Data URL dari gambar QR Code dalam format PNG.
 */
const generateQRCodeFromUrl = (baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 4. Generate QR code dari URL yang sudah lengkap.
        const qrCodeDataUrl = yield qrcode_1.default.toDataURL(baseUrl, {
            errorCorrectionLevel: "H",
            margin: 2,
            scale: 8,
            color: {
                dark: "#003366",
                light: "#FFFFFF",
            },
        });
        return qrCodeDataUrl;
    }
    catch (error) {
        console.error("Gagal membuat QR Code:", error);
        throw new Error("Gagal memproses pembuatan QR Code.");
    }
});
exports.default = generateQRCodeFromUrl;
