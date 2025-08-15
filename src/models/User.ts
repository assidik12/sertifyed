import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/userType";

const UserSchema: Schema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["institution", "student", "verifier"],
    default: "student",
  },
  walletAddress: {
    type: String,
    unique: true,
  },
  sertificates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      required: false,
    },
  ],
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
