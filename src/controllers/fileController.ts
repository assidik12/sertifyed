import { Request, Response } from "express";
import { FileModel } from "../models/File";
import Mitra from "../models/Insitution";

export const uploadSingleFile = async (req: Request, res: Response) => {
  try {
    const mitraId = req.body.mitraId;

    if (!mitraId) {
      return res.status(400).json({ message: "Mitra ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = await FileModel.create({
      filename: req.file.filename,
      path: `uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const mitra = await Mitra.findByIdAndUpdate(
      mitraId,
      {
        sertifImage: file.path,
      },
      { new: true }
    );

    res.status(201).json({
      message: "file uploaded successfully",
      file,
      mitra,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error uploading file",
        error: error.message,
      });
    }
  }
};

export const uploadMultipleFiles = async (req: Request, res: Response) => {
  try {
    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      return res.status(400).json({ message: "Tidak ada file yang diupload!" });
    }

    const files = await FileModel.insertMany(
      req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
      }))
    );

    res.status(200).json({
      message: "Upload multiple berhasil!",
      files,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};
