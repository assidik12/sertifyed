import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const mongodbUri: string = process.env.MONGODB_URI;


const dbConfig = {
    connect: async () => {
        try {
            await mongoose.connect(mongodbUri);
            console.log("Database connected");
        } catch (error) {
            console.error("Database connection error:", error);
        }
    }
}

export default dbConfig;