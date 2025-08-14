import { createHash } from "crypto";

/**
 * Menghitung hash SHA-256 dari data sertifikat.
 * @param {Record<string, any>} certificateData - Objek berisi semua detail sertifikat.
 * @returns {string} - Hash SHA-256 dalam format hex.
 */
export const createDataHash = (certificateData: Record<string, any>): string => {
  const sortedData = Object.keys(certificateData)
    .sort()
    .reduce((obj: Record<string, any>, key: string) => {
      obj[key] = certificateData[key];
      return obj;
    }, {});

  const jsonString = JSON.stringify(sortedData);
  return "0x" + createHash("sha256").update(jsonString).digest("hex");
};
