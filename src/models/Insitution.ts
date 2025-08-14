import mongoose, { Schema } from "mongoose";

const InstitutionSchema: Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  institutionName: {
    type: String,
    required: true,
  },
  certificates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      required: false,
    },
  ],
  sertifImage: {
    type: String,
    required: false,
  },
  refreshToken: {
    type: String,
    required: false,
  },
});

const Institution = mongoose.model("Insitution", InstitutionSchema);

export default Institution;
