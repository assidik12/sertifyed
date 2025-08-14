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
exports.uploadCertificate = uploadCertificate;
exports.getVerificationDataById = getVerificationDataById;
exports.getCertificateByOwner = getCertificateByOwner;
const promises_1 = __importDefault(require("fs/promises")); // Gunakan versi promise untuk async/await
const blockchainService_1 = require("../services/blockchainService");
const File_1 = require("../models/File");
const Certificate_1 = __importDefault(require("../models/Certificate"));
const hash_1 = require("../utils/hash");
const emailService_1 = require("../services/emailService");
function uploadCertificate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { studentName, studentEmail, courseTitle, issuerName, recipientWallet, certificateDescription, grade } = req.body;
        const file = req.file;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId || !studentName || !studentEmail || !courseTitle || !issuerName || !recipientWallet || !certificateDescription || !grade) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        if (!studentName || !courseTitle || !issuerName || !recipientWallet) {
            // Jika ada field yang kurang, hapus file yang sudah terlanjur di-upload
            yield promises_1.default.unlink(file.path);
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        // Simpan metadata file terlebih dahulu
        const uploadedFile = yield File_1.FileModel.create({
            filename: file.filename,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
        });
        try {
            // LANGKAH 1: Siapkan data yang akan disimpan dan di-hash
            const certificateDataToStore = {
                studentName,
                courseTitle,
                issueDate: new Date(),
                issuerName,
                recipientWallet,
                certificateDescription: certificateDescription || undefined, // Set ke undefined jika kosong
                grade: grade || undefined, // Set ke undefined jika kosong
            };
            // LANGKAH 2: Buat "Sidik Jari Digital" (dataHash)
            const dataHash = (0, hash_1.createDataHash)(certificateDataToStore);
            // LANGKAH 3: Terbitkan di Blockchain
            console.log(`Menerbitkan ke blockchain untuk wallet: ${recipientWallet}`);
            const { tokenId, transactionHash } = yield (0, blockchainService_1.issueCertificateOnChain)(recipientWallet, dataHash);
            console.log(`Berhasil di-mint! Token ID: ${tokenId}, Tx Hash: ${transactionHash}`);
            // LANGKAH 4: Simpan bukti lengkap ke CertificateModel
            const datas = Object.assign(Object.assign({}, certificateDataToStore), { // Gunakan data yang sudah disiapkan
                tokenId,
                transactionHash,
                dataHash, file: uploadedFile._id, organization: userId });
            yield Certificate_1.default.create(datas);
            const sendByEmail = yield (0, emailService_1.sendEmail)(studentEmail, studentName, {
                courseTitle,
                issuerName,
                issueDate: new Date(),
                tokenId: tokenId,
                transactionHash: transactionHash,
                verifyUrl: `https://sepolia.etherscan.io/tx/${transactionHash}`,
            });
            if (!sendByEmail) {
                console.error("Gagal mengirim email");
                res.status(500).json({ message: "Gagal mengirim email" });
                return;
            }
            // LANGKAH 5: Kirim respons sukses
            res.status(201).json({
                message: "Sertifikat berhasil diterbitkan on-chain dan off-chain.",
                tokenId,
                transactionHash,
            });
        }
        catch (error) {
            console.error("Error saat proses penerbitan sertifikat:", error);
            // Rollback: hapus file fisik dan record dari database
            try {
                yield promises_1.default.unlink(file.path);
                yield File_1.FileModel.deleteOne({ _id: uploadedFile._id });
                console.log(`Rollback berhasil: file ${file.filename} dan record DB telah dihapus.`);
            }
            catch (cleanupError) {
                console.error("Error saat melakukan cleanup (rollback):", cleanupError);
            }
            // Penanganan error yang lebih spesifik
            if (error instanceof Error && error.name === "MongoServerError" && error.code === 11000) {
                res.status(409).json({
                    // 409 Conflict lebih cocok untuk duplikasi
                    message: "Gagal menerbitkan sertifikat: Data duplikat terdeteksi.",
                    error: "Duplicate key error.",
                    detail: error.errmsg,
                });
            }
            if (error instanceof Error && error.name === "ValidationError") {
                res.status(400).json({
                    message: "Gagal menerbitkan sertifikat karena data tidak valid.",
                    error: error.message,
                });
            }
            res.status(500).json({
                message: "Gagal menerbitkan sertifikat.",
                error: error instanceof Error ? error.message : String(error),
            });
        }
    });
}
function getVerificationDataById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n1. Mengambil data sertifikat... By ID");
        const { tokenId } = req.params;
        try {
            const certificate = yield Certificate_1.default.findOne({ tokenId });
            console.log("\n1. Mengambil data sertifikat...");
            console.log(`Mengambil data sertifikat dengan Token ID: ${tokenId}`);
            console.log(`   -> Sertifikat: ${certificate}`);
            if (!certificate || !certificate.tokenId) {
                res.status(404).json({ message: "Sertifikat tidak ditemukan" });
                return;
            }
            const { dataHash, ownerWallet } = yield (0, blockchainService_1.getOnChainVerificationData)(certificate.tokenId);
            if (dataHash === certificate.dataHash && ownerWallet === certificate.recipientWallet) {
                const data = {
                    transactionHash: certificate.transactionHash,
                    dataHash: certificate.dataHash,
                    studentName: certificate.studentName,
                    courseTitle: certificate.courseTitle,
                    issueDate: certificate.issueDate,
                    issuerName: certificate.issuerName,
                    recipientWallet: certificate.recipientWallet,
                    certificateDescription: certificate.certificateDescription,
                    grade: certificate.grade,
                    tokenId: certificate.tokenId,
                    organization: certificate.organization,
                    file: certificate.file,
                };
                res.status(200).json({ message: "Sertifikat ditemukan dalam blockchain", data });
            }
            else {
                res.status(400).json({ message: "Data tidak cocok dengan yang ada di blockchain" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Terjadi kesalahan", error });
        }
    });
}
function getCertificateByOwner(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n1. Mengambil data sertifikat... By Owner");
        const { walletAddress } = req.body;
        try {
            const certificate = yield Certificate_1.default.findOne({ recipientWallet: walletAddress });
            if (!certificate) {
                res.status(404).json({ message: "Sertifikat tidak ditemukan" });
                return;
            }
            const datas = yield (0, blockchainService_1.getTokenIdsByOwner)(walletAddress);
            if (!datas) {
                res.status(404).json({ message: "Sertifikat tidak ditemukan" });
                return;
            }
            const tokenIds = datas.map((tokenId) => Number(tokenId));
            const offChainCertificates = [];
            for (const tokenId of tokenIds) {
                const offChainCertificate = yield Certificate_1.default.findOne({ tokenId });
                if (offChainCertificate) {
                    offChainCertificates.push(offChainCertificate);
                }
            }
            res.status(200).json({ message: "Sertifikat ditemukan dalam blockchain", offChainCertificates });
        }
        catch (error) {
            res.status(500).json({ message: "Terjadi kesalahan", error });
        }
    });
}
