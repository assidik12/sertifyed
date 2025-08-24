import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const registerUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  walletAddress: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().optional(),
});

const registerInstitutionSchema = Joi.object({
  institutionName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  password: Joi.string().min(6).required(),
  mitra: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createCertificateSchema = Joi.object({
  studentName: Joi.string().min(2).max(100).required(),
  studentEmail: Joi.string().email().required(),
  courseTitle: Joi.string().min(2).max(100).required(),
  issuerName: Joi.string().min(2).max(100).required(),
  recipientWallet: Joi.string().required(),
  certificateDescription: Joi.string().max(500).optional(),
  grade: Joi.string().max(10).optional(),
});

export const validateUserRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = registerUserSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};
export const validateInstitutionRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = registerInstitutionSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

export const validateCreateCertificate = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createCertificateSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Missing required fields",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};
