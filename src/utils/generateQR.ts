import QRCode from "qrcode";

export interface CertificateQRData {
  studentName: string;
  courseTitle: string;
  issueDate: Date;
  issuerName: string;
  tokenId: number | string;
  verifyUrl: string;
}

/**
 * Membuat QR Code dari objek data sertifikat.
 * Objek data akan diubah menjadi string JSON sebelum di-encode.
 * @param data - Objek yang berisi data penting sertifikat.
 * @returns Data URL dari gambar QR Code dalam format PNG.
 */
const generateQRCodeFromData = async (data: CertificateQRData): Promise<string> => {
  try {
    // 1. Ubah objek JavaScript menjadi string dengan format JSON.
    const dataString = JSON.stringify(data);

    // 2. Buat QR Code dari string JSON tersebut.
    // Opsi 'errorCorrectionLevel: 'H'' membuatnya lebih tahan terhadap kerusakan.
    const qrCodeDataUrl = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: "H",
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Gagal membuat QR Code:", error);
    // Mengembalikan string kosong atau melempar error kembali, tergantung kebutuhan Anda.
    throw new Error("Gagal memproses pembuatan QR Code.");
  }
};

export default generateQRCodeFromData;
