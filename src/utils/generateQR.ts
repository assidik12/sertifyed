import QRCode from "qrcode";

/**
 * Membuat QR Code yang mengarah ke URL dengan data sertifikat tersemat.
 * Data akan diubah menjadi string JSON, di-encode ke Base64, dan ditambahkan sebagai parameter URL.
 * @param data - Objek yang berisi data penting sertifikat.
 * @param baseUrl - URL halaman web yang akan menampilkan data (misal: 'https://domain-anda.com/tampilan-sertifikat.html').
 * @returns Data URL dari gambar QR Code dalam format PNG.
 */
const generateQRCodeFromUrl = async (baseUrl: string): Promise<string> => {
  try {
    // 4. Generate QR code dari URL yang sudah lengkap.
    const qrCodeDataUrl = await QRCode.toDataURL(baseUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      scale: 8,
      color: {
        dark: "#003366",
        light: "#FFFFFF",
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Gagal membuat QR Code:", error);
    throw new Error("Gagal memproses pembuatan QR Code.");
  }
};

export default generateQRCodeFromUrl;
