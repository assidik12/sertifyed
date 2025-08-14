"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataHash = void 0;
const crypto_1 = require("crypto");
/**
 * Menghitung hash SHA-256 dari data sertifikat.
 * @param {Record<string, any>} certificateData - Objek berisi semua detail sertifikat.
 * @returns {string} - Hash SHA-256 dalam format hex.
 */
const createDataHash = (certificateData) => {
    const sortedData = Object.keys(certificateData)
        .sort()
        .reduce((obj, key) => {
        obj[key] = certificateData[key];
        return obj;
    }, {});
    const jsonString = JSON.stringify(sortedData);
    return "0x" + (0, crypto_1.createHash)("sha256").update(jsonString).digest("hex");
};
exports.createDataHash = createDataHash;
