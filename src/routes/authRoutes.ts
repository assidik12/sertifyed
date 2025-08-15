import userController from "../controllers/authcontroller";
import { validateLogin, validateInstitutionRegister, validateUserRegister } from "../middleware/validation";
import { Router } from "express";
import protectRoute from "../middleware/protectRoute";
const authRoute = Router();

authRoute.post("/register/user", protectRoute, validateUserRegister, userController.registerUser);
authRoute.post("/login", validateLogin, userController.login);
authRoute.get("/refresh-token", userController.refreshToken);
authRoute.post("/logout", protectRoute, userController.logout);

// register institution
authRoute.post("/register/institution", validateInstitutionRegister, userController.registerInstitution);

export default authRoute;
