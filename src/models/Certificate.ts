// src/models/Certificate.ts

import mongoose, { Schema, Document } from "mongoose";

// Interface untuk mendefinisikan tipe data dari sebuah dokumen sertifikat
export interface ICertificate extends Document {
  // Data yang dikirim dari frontend & digunakan untuk membuat hash
  studentName: string;
  courseTitle: string;
  issueDate: Date;
  issuerName: string;
  recipientWallet: string;
  certificateDescription?: string;
  grade?: string;

  // Data yang didapat dari/untuk blockchain
  tokenId: number;
  transactionHash: string;
  dataHash: string; // Hash dari semua data di atas

  // Relasi ke model lain
  organization: mongoose.Schema.Types.ObjectId; // Foreign key untuk Organization
  file: mongoose.Schema.Types.ObjectId; // Foreign key untuk File
}

// Definisikan Skema Mongoose
const CertificateSchema: Schema = new Schema(
  {
    // Data utama sertifikat
    studentName: {
      type: String,
      required: [true, "Nama siswa wajib diisi."],
    },
    courseTitle: {
      type: String,
      required: [true, "Judul kursus/sertifikat wajib diisi."],
    },
    issueDate: {
      type: Date,
      required: [true, "Tanggal penerbitan wajib diisi."],
    },
    issuerName: {
      type: String,
      required: [true, "Nama penerbit wajib diisi."],
    },
    recipientWallet: {
      type: String,
      required: [true, "Alamat wallet penerima wajib diisi."],
    },
    certificateDescription: {
      type: String,
      required: false, // Opsional
    },
    grade: {
      type: String,
      required: false, // Opsional
    },

    // Data dari/untuk blockchain
    tokenId: {
      type: Number,
      required: [true, "Token ID dari blockchain wajib ada."],
      unique: true,
      index: true, // Tambahkan index untuk pencarian cepat
    },
    transactionHash: {
      type: String,
      required: [true, "Hash transaksi dari blockchain wajib ada."],
      unique: true,
    },
    dataHash: {
      type: String,
      required: [true, "Hash data untuk verifikasi wajib ada."],
    },

    // Relasi ke model lain
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    file: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
  },
  {
    // Opsi skema
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
  }
);

// Membuat model dari skema dan mengekspornya
const CertificateModel = mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default CertificateModel;
