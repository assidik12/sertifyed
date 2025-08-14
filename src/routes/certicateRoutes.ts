import { Router } from "express";
import { upload } from "../config/multer.config";
import { uploadCertificate, getCertificateByOwner, getVerificationDataById } from "../controllers/certificateController";
import protectRoute from "../middleware/protectRoute";

const certificateRoute = Router();

// get certificate from recipient
certificateRoute.get("/user", getCertificateByOwner);

// get verification data by id
certificateRoute.get("/:tokenId", getVerificationDataById);

// create certificate from institution
certificateRoute.post("/", protectRoute, upload.single("certificate"), uploadCertificate);

export default certificateRoute;
