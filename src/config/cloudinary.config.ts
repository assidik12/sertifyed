import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Konfigurasi koneksi ke akun Cloudinary Anda
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Konfigurasi storage engine untuk multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sertifyed", // Nama folder di Cloudinary untuk menyimpan file
    allowed_formats: ["pdf"], // Hanya izinkan format PDF
    format: "pdf",
    // Anda bisa menambahkan parameter lain di sini jika perlu
    // public_id: (req, file) => 'custom_file_name', // contoh untuk nama file custom
  } as any, // 'any' diperlukan karena tipe 'params' di library mungkin tidak lengkap
});

// Inisialisasi Multer dengan storage engine Cloudinary
export const uploadPdf = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Batas ukuran file 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("File yang diupload harus dalam format PDF."));
    }
  },
});
