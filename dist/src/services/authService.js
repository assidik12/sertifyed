"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// services/authService.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const Insitution_1 = __importDefault(require("../models/Insitution"));
const jwtUtils_1 = require("../utils/jwtUtils");
const User_1 = __importDefault(require("../models/User"));
class AuthService {
    // register user as recipient
    registerUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, issuerAddress, role, walletAddress } = userData;
                const existingUser = yield User_1.default.findOne({ email });
                const existingIssuer = yield Insitution_1.default.findOne({ address: issuerAddress });
                if (!existingIssuer) {
                    throw new Error("Issuer not found, cannot register user");
                }
                if (existingUser) {
                    throw new Error("User already exists");
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const newUser = new User_1.default({
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    walletAddress,
                });
                return yield newUser.save();
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    // register user as institution(issuer)
    registerInstitution(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { institutionName, email, password, address } = userData;
                const existingUser = yield Insitution_1.default.findOne({ email });
                if (existingUser) {
                    throw new Error("Institution already exists");
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const newUser = new Insitution_1.default({
                    institutionName,
                    email,
                    password: hashedPassword,
                    address,
                });
                return yield newUser.save();
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    loginUser(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = loginData;
                let payload;
                let accessToken, refreshToken;
                // Check if the uer is a student or an issuer
                const issuer = yield Insitution_1.default.findOne({ email });
                if (!issuer) {
                    const user = yield User_1.default.findOne({ email });
                    if (!user) {
                        throw new Error("User not found");
                    }
                    const isPasswordValid = yield bcrypt_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials");
                    }
                    // If the user is a student, create a payload with user details
                    payload = {
                        id: user === null || user === void 0 ? void 0 : user._id.toString(),
                        email: user === null || user === void 0 ? void 0 : user.email,
                        owner: user === null || user === void 0 ? void 0 : user.name,
                        walletAddress: user === null || user === void 0 ? void 0 : user.walletAddress,
                        role: "student",
                    };
                    // Generate tokens for the user
                    accessToken = (0, jwtUtils_1.generateToken)(payload, "access");
                    refreshToken = (0, jwtUtils_1.generateToken)(payload, "refresh");
                    // Update the user's refresh token in the database
                    yield User_1.default.updateOne({ _id: payload.id }, { refreshToken });
                }
                else {
                    // If the user is an issuer, create a payload with issuer details
                    const isPasswordValid = yield bcrypt_1.default.compare(password, issuer.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials");
                    }
                    // Generate tokens for the issuer
                    payload = {
                        email: issuer.email,
                        id: issuer._id,
                        owner: issuer.institutionName,
                        walletAddress: issuer.address,
                        role: "issuer",
                    };
                    // Generate access and refresh tokens
                    accessToken = (0, jwtUtils_1.generateToken)(payload, "access");
                    refreshToken = (0, jwtUtils_1.generateToken)(payload, "refresh");
                    // Update the issuer's refresh token in the database
                    yield Insitution_1.default.updateOne({ _id: payload.id }, { refreshToken });
                }
                return {
                    accessToken,
                    refreshToken,
                };
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken) {
                throw new Error("No refresh token provided");
            }
            const payload = (0, jwtUtils_1.verifyToken)(refreshToken, "refresh");
            const accessToken = (0, jwtUtils_1.generateToken)(payload, "access");
            return accessToken;
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Insitution_1.default.findOne({ email });
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Insitution_1.default.findById(id);
        });
    }
    updateRefreshToken(userId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Insitution_1.default.updateOne({ _id: userId }, { refreshToken });
        });
    }
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Insitution_1.default.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });
        });
    }
}
exports.default = new AuthService();
