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
exports.pinFileToPinata = exports.uploadPdf = void 0;
const multer_1 = __importDefault(require("multer"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const apiKey = process.env.PINATA_API_KEY;
const apiSecret = process.env.PINATA_API_SECRET;
exports.uploadPdf = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("File type not allowed"));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
    preservePath: true,
});
const pinFileToPinata = (fileBuffer, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
        console.log(`Mencoba mengunggah dan pin file: ${fileName} ke Pinata...`);
        // Use 'form-data' package for Node.js compatibility
        const formData = new form_data_1.default();
        formData.append("file", fileBuffer, fileName);
        formData.append("pinataMetadata", JSON.stringify({ name: fileName }));
        formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));
        formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));
        const response = yield axios_1.default.post(url, formData, {
            maxBodyLength: Infinity, // untuk menghindari batasan ukuran
            headers: Object.assign(Object.assign({}, formData.getHeaders()), { pinata_api_key: apiKey, pinata_secret_api_key: apiSecret }),
        });
        if (response.status === 200) {
            const cid = response.data.IpfsHash;
            console.log(`Sukses! File di-pin di Pinata dengan CID: ${cid}`);
            return `https://ipfs.io/ipfs/${cid}`;
        }
        else {
            throw new Error(`Pinata merespons dengan status: ${response.status}`);
        }
    }
    catch (error) {
        console.error(`Gagal mengunggah file ke Pinata:`, error.response ? error.response.data : error.message);
        throw new Error(`Gagal saat berkomunikasi dengan Pinata Pinning Service.`);
    }
});
exports.pinFileToPinata = pinFileToPinata;
