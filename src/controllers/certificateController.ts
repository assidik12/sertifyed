import { Request, Response } from "express";
import { getOnChainVerificationData, getTokenIdsByOwner, issueCertificateOnChain } from "../services/blockchainService";
import CertificateModel from "../models/Certificate";
import { createDataHash } from "../utils/hash";
import { CustomRequest } from "../types/customRequest";
import { sendEmail } from "../services/emailService";
import { pinFileToPinata } from "../config/pinata.config";
import { StoredCertificateDataOffChain, StoredCertificateDataOnChain } from "../types/certificateType";

export async function uploadCertificate(req: CustomRequest, res: Response): Promise<void> {
  const { studentName, studentEmail, courseTitle, issuerName, recipientWallet, certificateDescription, grade } = req.body;
  const file = req.file;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    const Pinning = await pinFileToPinata(file.buffer, file.originalname);

    if (!Pinning) {
      throw new Error("Gagal mengunggah file ke Pinata");
    }

    const certificateDataToStore: StoredCertificateDataOnChain = {
      studentName,
      courseTitle,
      issueDate: new Date(),
      issuerName,
      recipientWallet,
      fileUploader: Pinning,
      grade: grade || undefined, // Set ke undefined jika kosong
    };

    // LANGKAH 2: Buat "Sidik Jari Digital" (dataHash)
    const dataHash = createDataHash(certificateDataToStore);

    // LANGKAH 3: Terbitkan di Blockchain
    console.log(`Menerbitkan ke blockchain untuk wallet: ${recipientWallet}`);
    const { tokenId, transactionHash } = await issueCertificateOnChain(recipientWallet, dataHash);
    console.log(`Berhasil di-mint! Token ID: ${tokenId}, Tx Hash: ${transactionHash}`);

    // LANGKAH 4: Simpan bukti lengkap ke CertificateModel
    const datas: StoredCertificateDataOffChain = {
      courseTitle,
      fileUploader: Pinning,
      organization: userId,
      dataHash,
      issueDate: new Date(),
      issuerName,
      recipientWallet,
      studentName,
      tokenId,
      transactionHash,
      certificateDescription,
      grade: grade || undefined,
    };
    await CertificateModel.create(datas);

    const sendByEmail = await sendEmail(studentEmail, studentName, {
      courseTitle,
      issuerName,
      issueDate: new Date(),
      tokenId: tokenId,
      fileUploader: Pinning,
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

    if (!certificate || !certificate.tokenId) {
      res.status(404).json({ message: "Sertifikat tidak ditemukan" });
      return;
    }

    const { dataHash, ownerWallet } = await getOnChainVerificationData(certificate.tokenId);
    if (dataHash === certificate.dataHash && ownerWallet === certificate.recipientWallet) {
      const data = {
        studentName: certificate.studentName,
        courseTitle: certificate.courseTitle,
        issueDate: certificate.issueDate,
        issuerName: certificate.issuerName,
        recipientWallet: certificate.recipientWallet,
        certificateDescription: certificate.certificateDescription,
        grade: certificate.grade,
        tokenId: certificate.tokenId,
        fileUploader: certificate.fileUploader,
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
        offChainCertificates.push({
          studentName: offChainCertificate.studentName,
          courseTitle: offChainCertificate.courseTitle,
          issueDate: offChainCertificate.issueDate,
          issuerName: offChainCertificate.issuerName,
          recipientWallet: offChainCertificate.recipientWallet,
          certificateDescription: offChainCertificate.certificateDescription,
          grade: offChainCertificate.grade,
          fileUploader: offChainCertificate.fileUploader,
          tokenId: offChainCertificate.tokenId,
          id_transaction: offChainCertificate.transactionHash,
        });
      }
    }

    res.status(200).json({ message: "Sertifikat ditemukan dalam blockchain", offChainCertificates });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
}
