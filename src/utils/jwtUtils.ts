import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types/tokenPayload";

export const generateToken = (payload: TokenPayload, type: "access" | "refresh"): string => {
  try {
    const secret = type === "access" ? ((process.env.ACCESS_TOKEN_SECRET || "ASDFGHJKL0987654321") as string) : ((process.env.REFRESH_TOKEN_SECRET || "KJHGFDSA0987654321") as string);

    const expiresIn = type === "access" ? ((process.env.ACCESS_TOKEN_EXPIRY || "15m") as string) : ((process.env.REFRESH_TOKEN_EXPIRY || "7d") as string);

    return jwt.sign(payload, secret, {
      expiresIn,
    } as jwt.SignOptions);
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

export const verifyToken = (token: string, type: "access" | "refresh"): TokenPayload => {
  try {
    const secret = type === "access" ? ((process.env.ACCESS_TOKEN_SECRET || "ASDFGHJKL0987654321") as string) : ((process.env.REFRESH_TOKEN_SECRET || "KJHGFDSA0987654321") as string);

    const decode = jwt.verify(token, secret) as any;

    return {
      id: decode.id,
      email: decode.email,
      owner: decode.institutionName,
      role: decode.role,
      walletAddress: decode.walletAddress,
    };
  } catch (error) {
    throw new Error("Token verification failed");
  }
};
