import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtUtils";
import type { CustomRequest } from "../types/customRequest";

const protectRoute = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    const payload = verifyToken(token, "access");
    req.user = {
      id: payload.id,
      email: payload.email,
      institutionName: payload.owner,
    } as any;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default protectRoute;
