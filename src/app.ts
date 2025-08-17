import dotenv from "dotenv";
dotenv.config();
import express from "express";
import dbconfig from "./config/db.config";
import authRoute from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import path from "path";
import certificateRoute from "./routes/certicateRoutes";
import rateLimit from "express-rate-limit";
import cors from "cors";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

const app = express();

const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1); // Enable trust proxy for rate limiting and CORS

const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yaml"));

// Buat route untuk dokumentasi API
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const allowedOrigins = ["http://localhost:5173", "https://sertifyed.vercel.app/", "https://localhost:3000/"];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // allow requests with no origin
    if (!origin) return callback(null, true);
    // allow requests from specified origins
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // WAJIB ada untuk mengizinkan cookies/credentials
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};

app.use(cors(corsOptions));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" })); // Limit JSON body size to 2MB
app.use(express.urlencoded({ extended: true, limit: "2mb" })); // Limit URL-encoded body size to 2MB

dbconfig.connect();

// Set up routes
// app.use("/api/upload", uploadRoute);
app.use("/api/certificate", certificateRoute);
app.use("/api/auth", authRoute);

// testing api
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World!");
});

// Global Error Handler Multer
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.message.includes("Hanya file gambar")) {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Ukuran file terlalu besar (max 2MB)" });
  }
  return res.status(500).json({ message: "Internal Server Error", error: err.message });
});

export default app;
