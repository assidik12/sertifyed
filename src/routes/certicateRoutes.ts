import { Router } from "express";
import { uploadPdf } from "../config/cloudinary.config";
import { uploadCertificate, getCertificateByOwner, getVerificationDataById } from "../controllers/certificateController";
import protectRoute from "../middleware/protectRoute";

const certificateRoute = Router();

// get certificate from recipient
certificateRoute.get("/user", getCertificateByOwner);

// get verification data by id
certificateRoute.get("/:tokenId", getVerificationDataById);

// create certificate from institution
certificateRoute.post("/", protectRoute, uploadPdf.single("certificate"), uploadCertificate);

export default certificateRoute;
