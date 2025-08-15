// services/authService.ts
import bcrypt from "bcrypt";
import Institution from "../models/Insitution";
import { generateToken, verifyToken } from "../utils/jwtUtils";
import { TokenPayload } from "../types/tokenPayload";
import type { RegisterUserData, LoginUserData, LoginResult, RegisterInstitutionData } from "../types/authType";
import User from "../models/User";

class AuthService {
  // register user as recipient
  async registerUser(userData: RegisterUserData): Promise<void> {
    const { name, email, password, address, role, walletAddress } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || "student",
      walletAddress,
    });
    await newUser.save();
  }

  // register user as institution(issuer)
  async registerInstitution(userData: RegisterInstitutionData): Promise<void> {
    const { institutionName, email, password, address } = userData;

    const existingUser = await Institution.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Institution({
      institutionName,
      email,
      password: hashedPassword,
      address,
    });

    await newUser.save();
  }

  async loginUser(loginData: LoginUserData): Promise<LoginResult> {
    const { email, password } = loginData;

    try {
      let payload: TokenPayload;
      let accessToken: string, refreshToken: string;

      // Check if the uer is a student or an issuer
      const issuer = await Institution.findOne({ email });

      if (!issuer) {
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt.compare(password, user?.password as string);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
        // If the user is a student, create a payload with user details
        payload = {
          id: user?._id.toString() as string,
          email: user?.email as string,
          owner: user?.name,
          walletAddress: user?.walletAddress,
          role: "student",
        };

        // Generate tokens for the user
        accessToken = generateToken(payload, "access");
        refreshToken = generateToken(payload, "refresh");

        // Update the user's refresh token in the database
        await User.updateOne({ _id: payload.id }, { refreshToken });
      } else {
        // If the user is an issuer, create a payload with issuer details
        const isPasswordValid = await bcrypt.compare(password, issuer.password as string);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
        // Generate tokens for the issuer
        payload = {
          email: issuer.email as string,
          id: issuer._id as string,
          owner: issuer.institutionName as string,
          walletAddress: issuer.address as string,
          role: "issuer",
        };
        // Generate access and refresh tokens
        accessToken = generateToken(payload, "access");
        refreshToken = generateToken(payload, "refresh");

        // Update the issuer's refresh token in the database
        await Institution.updateOne({ _id: payload.id }, { refreshToken });
      }

      return {
        accessToken,
        refreshToken,
      };
    } catch (error: Error | any) {
      throw new Error(error.message);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new Error("No refresh token provided");
    }

    const payload = verifyToken(refreshToken, "refresh");
    const accessToken = generateToken(payload, "access");

    return accessToken;
  }

  async getUserByEmail(email: string) {
    return await Institution.findOne({ email });
  }

  async getUserById(id: string) {
    return await Institution.findById(id);
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await Institution.updateOne({ _id: userId }, { refreshToken });
  }

  async logout(userId: string): Promise<void> {
    await Institution.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });
  }
}

export default new AuthService();
