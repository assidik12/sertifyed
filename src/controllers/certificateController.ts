import { Request, Response } from "express";
import fs from "fs/promises"; // Gunakan versi promise untuk async/await
import { getOnChainVerificationData, getTokenIdsByOwner, issueCertificateOnChain } from "../services/blockchainService";
import { FileModel } from "../models/File";
import CertificateModel from "../models/Certificate";
import { createDataHash } from "../utils/hash";
import { CustomRequest } from "../types/customRequest";
import { sendEmail } from "../services/emailService";

export async function uploadCertificate(req: CustomRequest, res: Response): Promise<void> {
  const { studentName, studentEmail, courseTitle, issuerName, recipientWallet, certificateDescription, grade } = req.body;
  const file = req.file;
  const userId = req.user?.id;

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
    await fs.unlink(file.path);
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  // Simpan metadata file terlebih dahulu
  const uploadedFile = await FileModel.create({
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
    const dataHash = createDataHash(certificateDataToStore);

    // LANGKAH 3: Terbitkan di Blockchain
    console.log(`Menerbitkan ke blockchain untuk wallet: ${recipientWallet}`);
    const { tokenId, transactionHash } = await issueCertificateOnChain(recipientWallet, dataHash);
    console.log(`Berhasil di-mint! Token ID: ${tokenId}, Tx Hash: ${transactionHash}`);

    // LANGKAH 4: Simpan bukti lengkap ke CertificateModel
    const datas = {
      ...certificateDataToStore, // Gunakan data yang sudah disiapkan
      tokenId,
      transactionHash,
      dataHash,
      file: uploadedFile._id,
      organization: userId,
    };
    await CertificateModel.create(datas);

    const sendByEmail = await sendEmail(studentEmail, studentName, {
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
  } catch (error) {
    console.error("Error saat proses penerbitan sertifikat:", error);

    // Rollback: hapus file fisik dan record dari database
    try {
      await fs.unlink(file.path);
      await FileModel.deleteOne({ _id: uploadedFile._id });
      console.log(`Rollback berhasil: file ${file.filename} dan record DB telah dihapus.`);
    } catch (cleanupError) {
      console.error("Error saat melakukan cleanup (rollback):", cleanupError);
    }

    // Penanganan error yang lebih spesifik
    if (error instanceof Error && error.name === "MongoServerError" && (error as any).code === 11000) {
      res.status(409).json({
        // 409 Conflict lebih cocok untuk duplikasi
        message: "Gagal menerbitkan sertifikat: Data duplikat terdeteksi.",
        error: "Duplicate key error.",
        detail: (error as any).errmsg,
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
}

export async function getVerificationDataById(req: Request, res: Response): Promise<void> {
  console.log("\n1. Mengambil data sertifikat... By ID");
  const { tokenId } = req.params;

  try {
    const certificate = await CertificateModel.findOne({ tokenId });
    console.log("\n1. Mengambil data sertifikat...");
    console.log(`Mengambil data sertifikat dengan Token ID: ${tokenId}`);
    console.log(`   -> Sertifikat: ${certificate}`);

    if (!certificate || !certificate.tokenId) {
      res.status(404).json({ message: "Sertifikat tidak ditemukan" });
      return;
    }

    const { dataHash, ownerWallet } = await getOnChainVerificationData(certificate.tokenId);
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
    } else {
      res.status(400).json({ message: "Data tidak cocok dengan yang ada di blockchain" });
    }
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
}

export async function getCertificateByOwner(req: Request, res: Response): Promise<void> {
  console.log("\n1. Mengambil data sertifikat... By Owner");
  const { walletAddress } = req.body;

  try {
    const certificate = await CertificateModel.findOne({ recipientWallet: walletAddress });

    if (!certificate) {
      res.status(404).json({ message: "Sertifikat tidak ditemukan" });
      return;
    }

    const datas: bigint[] = await getTokenIdsByOwner(walletAddress);

    if (!datas) {
      res.status(404).json({ message: "Sertifikat tidak ditemukan" });
      return;
    }
    const tokenIds = datas.map((tokenId) => Number(tokenId));

    const offChainCertificates: any[] = [];
    for (const tokenId of tokenIds) {
      const offChainCertificate = await CertificateModel.findOne({ tokenId });
      if (offChainCertificate) {
        offChainCertificates.push(offChainCertificate);
      }
    }

    res.status(200).json({ message: "Sertifikat ditemukan dalam blockchain", offChainCertificates });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
}
