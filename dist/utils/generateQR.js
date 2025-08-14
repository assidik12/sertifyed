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
 * Membuat QR Code dari objek data sertifikat.
 * Objek data akan diubah menjadi string JSON sebelum di-encode.
 * @param data - Objek yang berisi data penting sertifikat.
 * @returns Data URL dari gambar QR Code dalam format PNG.
 */
const generateQRCodeFromData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Ubah objek JavaScript menjadi string dengan format JSON.
        const dataString = JSON.stringify(data);
        // 2. Buat QR Code dari string JSON tersebut.
        // Opsi 'errorCorrectionLevel: 'H'' membuatnya lebih tahan terhadap kerusakan.
        const qrCodeDataUrl = yield qrcode_1.default.toDataURL(dataString, {
            errorCorrectionLevel: "H",
        });
        return qrCodeDataUrl;
    }
    catch (error) {
        console.error("Gagal membuat QR Code:", error);
        // Mengembalikan string kosong atau melempar error kembali, tergantung kebutuhan Anda.
        throw new Error("Gagal memproses pembuatan QR Code.");
    }
});
exports.default = generateQRCodeFromData;
