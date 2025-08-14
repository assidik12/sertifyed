import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// const uploadDir = path.join(process.cwd(), "src/uploads");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (_req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (_req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });

// const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
//   const ext = path.extname(file.originalname).toLowerCase();

//   if (allowedTypes.includes(file.mimetype) && (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".gif" || ext === ".pdf")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only JPEG, PNG, PDF, and GIF files are allowed."));
//   }
// };

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
// });
