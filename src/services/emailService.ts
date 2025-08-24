import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";
import generateQRCodeFromData from "../utils/generateQR";

interface CertificateEmailPayload {
  courseTitle: string;
  issuerName: string;
  issueDate: Date;
  tokenId: number | string;
  fileUploader: string;
  verifyUrl: string;
}

/**
 * Helper function untuk membuat konten HTML email.
 */
function _createEmailHtml(
  recipientName: string,
  data: CertificateEmailPayload,
  qrCodeCid: string // Menerima CID, bukan data URL
): string {
  const { courseTitle, issuerName, issueDate, tokenId, fileUploader, verifyUrl } = data;
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
            <a href="${fileUploader}" class="button">Lihat Sertifikat Saya</a>
          </p>
          <table class="details-table">
            <tr><td>Diterbitkan pada</td><td>: ${formattedDate}</td></tr>
            <tr><td>Token ID</td><td>: ${tokenId}</td></tr>
            <tr><td>Link Verifikasi On-chain</td><td>: ${verifyUrl}</td></tr>
          </table>
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
export async function sendEmail(recipientEmail: string, recipientName: string, data: CertificateEmailPayload): Promise<boolean> {
  try {
    // Validasi environment variables
    const APIKEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    if (!APIKEY || !SENDER_EMAIL) {
      throw new Error("BREVO_API_KEY atau SENDER_EMAIL tidak diatur di environment variables");
    }

    // Inisialisasi Brevo API
    const emailAPI = new TransactionalEmailsApi();
    (emailAPI as any).authentications.apiKey.apiKey = APIKEY;

    // 2. Generate QR Code sebagai data URL base64
    const qrCodeDataUrl: string = await generateQRCodeFromData(data.fileUploader);

    // 3. Ekstrak konten base64 dari data URL
    const base64Content = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");

    // 4. Definisikan nama file untuk CID
    const qrCodeFilename = "qrcode.png";

    // 5. Buat konten HTML dengan mereferensikan CID
    const htmlContent = _createEmailHtml(recipientName, data, base64Content);

    // --- KONFIGURASI EMAIL ---
    const message = new SendSmtpEmail();
    message.subject = `Selamat! Sertifikat Baru Anda untuk "${data.courseTitle}" Telah Terbit`;
    message.sender = { name: data.issuerName, email: SENDER_EMAIL };
    message.to = [{ email: recipientEmail, name: recipientName }];
    message.htmlContent = htmlContent;

    // 6. Tambahkan gambar QR Code sebagai lampiran
    message.attachment = [
      {
        name: qrCodeFilename,
        content: base64Content,
      },
    ];

    // Kirim email
    await emailAPI.sendTransacEmail(message);
    console.log(`Email notifikasi dengan QR Code terlampir berhasil dikirim ke ${recipientEmail}`);
    return true;
  } catch (error: any) {
    console.error("Gagal mengirim email:", error.message);
    return false;
  }
}
