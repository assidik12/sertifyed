"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const db_config_1 = __importDefault(require("./config/db.config"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
// import uploadRoute from "./routes/fileRoutes";
const certicateRoutes_1 = __importDefault(require("./routes/certicateRoutes"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const yamljs_1 = __importDefault(require("yamljs"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "2mb" })); // Limit JSON body size to 2MB
app.use(express_1.default.urlencoded({ extended: true, limit: "2mb" })); // Limit URL-encoded body size to 2MB
db_config_1.default.connect();
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, "./docs/swagger.yaml"));
// Buat route untuk dokumentasi API
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Set up routes
// app.use("/api/upload", uploadRoute);
app.use("/api/certificate", certicateRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
// testing api
app.get("/", (req, res) => {
    res.send("Hello World!");
});
// Global Error Handler Multer
app.use((err, _req, res, _next) => {
    if (err.message.includes("Hanya file gambar")) {
        return res.status(400).json({ message: err.message });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Ukuran file terlalu besar (max 2MB)" });
    }
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
});
exports.default = app;
