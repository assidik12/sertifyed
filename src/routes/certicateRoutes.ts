import { Router } from "express";
import { uploadCertificate, getCertificateByOwner, getVerificationDataById } from "../controllers/certificateController";
import protectRoute from "../middleware/protectRoute";
import { validateCreateCertificate } from "../middleware/validation";
import { uploadPdf } from "../config/pinata.config";

const certificateRoute = Router();

// get certificate from recipient
certificateRoute.get("/user", getCertificateByOwner);

// get verification data by id
certificateRoute.get("/:tokenId", getVerificationDataById);

// create certificate from institution
certificateRoute.post("/", protectRoute, validateCreateCertificate, uploadPdf.single("certificate"), uploadCertificate);

export default certificateRoute;
