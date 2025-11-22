import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // loads .env silently

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI); // no deprecated options
    console.log("MongoDB connected Successful");
  } catch (error) {
    console.error("MongoDB connection failed ❌:", error.message);
    process.exit(1);
  }
};

export default connectDB;
