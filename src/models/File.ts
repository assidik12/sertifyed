import mongoose from "mongoose";

export interface IFile extends Document {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
}

const fileSchema = new mongoose.Schema<IFile>({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export const FileModel = mongoose.model<IFile>("File", fileSchema);
