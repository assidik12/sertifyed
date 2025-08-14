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
exports.sendEmail = sendEmail;
const brevo_1 = require("@getbrevo/brevo");
const generateQR_1 = __importDefault(require("../utils/generateQR"));
/**
 * Helper function untuk membuat konten HTML email.
 */
function _createEmailHtml(recipientName, data, qrCodeCid // Menerima CID, bukan data URL
) {
    const { courseTitle, issuerName, issueDate, tokenId, transactionHash, verifyUrl } = data;
    const formattedDate = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(issueDate));
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* CSS Anda tetap sama */
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background-color: #4A90E2; color: #ffffff; padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 40px; color: #333333; line-height: 1.6; }
        .content h2 { color: #4A90E2; }
        .button { display: inline-block; background-color: #4CAF50; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .details-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
        .details-table td { padding: 10px; border-bottom: 1px solid #eeeeee; }
        .qr-section { text-align: center; margin-top: 30px; }
        .footer { background-color: #f8f8f8; color: #888888; padding: 20px 40px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Sertifikat Digital Anda Telah Terbit!</h1></div>
        <div class="content">
          <p>Halo <strong>${recipientName}</strong>,</p>
          <p>Selamat! Sertifikat Anda untuk <strong>${courseTitle}</strong> telah berhasil diterbitkan oleh <strong>${issuerName}</strong>.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" class="button">Lihat Sertifikat Saya</a>
          </p>
          <table class="details-table">
            <tr><td>Diterbitkan pada</td><td>: ${formattedDate}</td></tr>
            <tr><td>Token ID</td><td>: ${tokenId}</td></tr>
            <tr><td>Transaksi Hash</td><td style="word-break: break-all;">: <a href="https://sepolia.etherscan.io/tx/${transactionHash}" target="_blank">${transactionHash}</a></td></tr>
          </table>
          <div class="qr-section">
            <p>Pindai kode QR di bawah ini untuk verifikasi cepat:</p>
            <!-- PERBAIKAN: Menggunakan CID untuk sumber gambar -->
            <img src="cid:${qrCodeCid}" alt="Kode QR Verifikasi" style="width: 150px; height: 150px;">
          </div>
        </div>
        <div class="footer"><p>&copy; ${new Date().getFullYear()} SertifyEd. Semua Hak Cipta Dilindungi.</p></div>
      </div>
    </body>
    </html>
  `;
}
/**
 * Mengirimkan email notifikasi dengan QR Code sebagai lampiran CID.
 */
function sendEmail(recipientEmail, recipientName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { issuerName, courseTitle, verifyUrl } = data;
            // Validasi environment variables
            const APIKEY = process.env.BREVO_API_KEY;
            const SENDER_EMAIL = process.env.SENDER_EMAIL;
            if (!APIKEY || !SENDER_EMAIL) {
                throw new Error("BREVO_API_KEY atau SENDER_EMAIL tidak diatur di environment variables");
            }
            // Inisialisasi Brevo API
            const emailAPI = new brevo_1.TransactionalEmailsApi();
            emailAPI.authentications.apiKey.apiKey = APIKEY;
            // --- PERSIAPAN LAMPIRAN (ATTACHMENT) ---
            // 1. Siapkan data untuk di-encode ke QR Code
            const qrData = {
                studentName: recipientName,
                courseTitle: data.courseTitle,
                issueDate: data.issueDate,
                issuerName: data.issuerName,
                tokenId: data.tokenId,
                verifyUrl: data.verifyUrl,
            };
            // 2. Generate QR Code sebagai data URL base64
            const qrCodeDataUrl = yield (0, generateQR_1.default)(qrData);
            // 3. Ekstrak hanya data base64 murni dari data URL
            // Contoh: dari "data:image/png;base64,iVBORw0KGgo..." menjadi "iVBORw0KGgo..."
            const base64Content = qrCodeDataUrl.split("base64,")[1];
            // 4. Definisikan nama file untuk CID
            const qrCodeFilename = "qrcode.png";
            // 5. Buat konten HTML dengan mereferensikan CID
            const htmlContent = _createEmailHtml(recipientName, data, qrCodeFilename);
            // --- KONFIGURASI EMAIL ---
            const message = new brevo_1.SendSmtpEmail();
            message.subject = `Selamat! Sertifikat Baru Anda untuk "${courseTitle}" Telah Terbit`;
            message.sender = { name: issuerName, email: SENDER_EMAIL };
            message.to = [{ email: recipientEmail, name: recipientName }];
            message.htmlContent = htmlContent;
            // 6. Tambahkan gambar QR Code sebagai lampiran
            message.attachment = [
                {
                    name: qrCodeFilename, // Nama file ini harus sama dengan CID di HTML
                    content: base64Content,
                },
            ];
            // Kirim email
            yield emailAPI.sendTransacEmail(message);
            console.log(`Email notifikasi dengan QR Code terlampir berhasil dikirim ke ${recipientEmail}`);
            return true;
        }
        catch (error) {
            console.error("Gagal mengirim email:", error.message);
            return false;
        }
    });
}
