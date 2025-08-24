import multer from "multer";
import axios from "axios";
import FormData from "form-data";

const apiKey: string | undefined = process.env.PINATA_API_KEY;
const apiSecret: string | undefined = process.env.PINATA_API_SECRET;

export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("File type not allowed"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  preservePath: true,
});

export const pinFileToPinata = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
  try {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    console.log(`Mencoba mengunggah dan pin file: ${fileName} ke Pinata...`);

    // Use 'form-data' package for Node.js compatibility
    const formData = new FormData();
    formData.append("file", fileBuffer, fileName);
    formData.append("pinataMetadata", JSON.stringify({ name: fileName }));
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

    const response = await axios.post(url, formData, {
      maxBodyLength: Infinity, // untuk menghindari batasan ukuran
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: apiKey!,
        pinata_secret_api_key: apiSecret!,
      },
    });

    if (response.status === 200) {
      const cid: string = response.data.IpfsHash;
      console.log(`Sukses! File di-pin di Pinata dengan CID: ${cid}`);
      return `https://ipfs.io/ipfs/${cid}`;
    } else {
      throw new Error(`Pinata merespons dengan status: ${response.status}`);
    }
  } catch (error: any) {
    console.error(`Gagal mengunggah file ke Pinata:`, error.response ? error.response.data : error.message);
    throw new Error(`Gagal saat berkomunikasi dengan Pinata Pinning Service.`);
  }
};
