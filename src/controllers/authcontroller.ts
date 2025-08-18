// controllers/authController.ts
import { Request, Response } from "express";
import authService from "../services/authService";
import type { CustomRequest } from "../types/customRequest";

const authController = {
  registerUser: async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { name, email, password, role, walletAddress } = req.body;
      const issuerAddress = req.user?.walletAddress as string;

      await authService.registerUser({ name, email, password, issuerAddress, role, walletAddress });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User already exists" || error.message === "Issuer not found, cannot register user") {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
  registerInstitution: async (req: Request, res: Response): Promise<void> => {
    try {
      const { institutionName, email, password, address } = req.body;

      await authService.registerInstitution({ institutionName, email, password, address });

      res.status(201).json({
        success: true,
        message: "Institution registered successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Institution already exists") {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      console.log("otw");

      const loginResult = await authService.loginUser({ email, password });

      res.cookie("refreshToken", loginResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          accessToken: loginResult.accessToken,
          refreshToken: loginResult.refreshToken,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User not found") {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }

        if (error.message === "Invalid credentials") {
          res.status(401).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  refreshToken: async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.cookies;

      const accessToken = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No refresh token provided") {
          res.status(401).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      console.error("Token refresh error:", error);
      res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }
  },

  logout: async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      // Assuming you have user ID from middleware
      const userId = req.user?.id;

      if (userId) {
        await authService.logout(userId);
      }

      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

export default authController;
