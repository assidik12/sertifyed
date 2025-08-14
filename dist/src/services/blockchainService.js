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
exports.getTokenIdsByOwner = exports.getOnChainVerificationData = exports.issueCertificateOnChain = void 0;
const ethers_1 = require("ethers");
// ABI smart contract
const SertifyEd_abi_json_1 = __importDefault(require("../helper/SertifyEd.abi.json"));
if (!process.env.SEPOLIA_RPC_URL || !process.env.MINTER_PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
    throw new Error("Variabel lingkungan PROVIDER_URL, MINTER_PRIVATE_KEY, dan CONTRACT_ADDRESS harus diatur.");
}
const provider = new ethers_1.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers_1.Wallet(process.env.MINTER_PRIVATE_KEY, provider);
const sertifyEdContract = new ethers_1.Contract(process.env.CONTRACT_ADDRESS, SertifyEd_abi_json_1.default, signer);
console.log(`Blockchain service terhubung ke contract di alamat: ${process.env.CONTRACT_ADDRESS}`);
/**
 * Memanggil fungsi issueCertificate di smart contract.
 * @param {string} recipientWallet - Alamat wallet mahasiswa.
 * @param {string} dataHash - Hash dari detail sertifikat.
 * @returns {Promise<{tokenId: number, transactionHash: string}>} - Berisi tokenId dan transactionHash.
 */
const issueCertificateOnChain = (recipientWallet, dataHash) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Menerbitkan sertifikat untuk ${recipientWallet} dengan hash ${dataHash}`);
        const tx = yield sertifyEdContract.issueCertificate(recipientWallet, dataHash);
        console.log(`Transaksi dikirim... Hash: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log("Transaksi berhasil di-mining!");
        const contractInterface = new ethers_1.Interface(SertifyEd_abi_json_1.default);
        const logs = ((receipt === null || receipt === void 0 ? void 0 : receipt.logs) || [])
            .map((log) => {
            try {
                return contractInterface.parseLog(log);
            }
            catch (e) {
                return null;
            }
        })
            .filter(Boolean);
        const issueEvent = logs.find((log) => (log === null || log === void 0 ? void 0 : log.name) === "CertificateIssued");
        if (!issueEvent) {
            throw new Error("Event CertificateIssued tidak ditemukan di dalam transaksi.");
        }
        const tokenId = issueEvent.args.tokenId;
        return {
            tokenId: Number(tokenId),
            transactionHash: tx.hash,
        };
    }
    catch (error) {
        console.error("Error saat menerbitkan sertifikat di blockchain:", error);
        throw new Error("Gagal melakukan transaksi di blockchain.");
    }
});
exports.issueCertificateOnChain = issueCertificateOnChain;
/**
 * Mengambil detail sertifikat dari blockchain untuk verifikasi.
 * @param {number} tokenId - ID unik sertifikat.
 * @returns {Promise<{issuerAddress: string, dataHash: string, ownerWallet: string}>} - Data on-chain.
 */
const getOnChainVerificationData = (tokenId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contractReader = sertifyEdContract.connect(provider);
        const [details, ownerWallet] = yield Promise.all([contractReader.getCertificateDetails(tokenId), contractReader.ownerOf(tokenId)]);
        return {
            issuerAddress: details.issuerAddress,
            dataHash: details.dataHash,
            ownerWallet: ownerWallet,
        };
    }
    catch (error) {
        console.error(`Error mengambil data on-chain untuk token ID ${tokenId}:`, error);
        throw new Error("Sertifikat tidak ditemukan di blockchain.");
    }
});
exports.getOnChainVerificationData = getOnChainVerificationData;
/**
 * Mengambil daftar tokenId yang dimiliki oleh sebuah alamat.
 * @param {string} ownerAddress - Alamat wallet pemilik.
 * @returns {Promise<number[]>} - Array berisi nomor tokenId.
 */
const getTokenIdsByOwner = (ownerAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contractReader = sertifyEdContract.connect(provider);
        const tokenIdsBigInt = yield contractReader.getCertificatesByOwner(ownerAddress);
        return tokenIdsBigInt;
    }
    catch (error) {
        console.error(`Error mengambil token untuk owner ${ownerAddress}:`, error);
        throw new Error("Gagal mengambil daftar sertifikat dari blockchain.");
    }
});
exports.getTokenIdsByOwner = getTokenIdsByOwner;
module.exports = {
    issueCertificateOnChain: exports.issueCertificateOnChain,
    getOnChainVerificationData: exports.getOnChainVerificationData,
    getTokenIdsByOwner: exports.getTokenIdsByOwner,
};
