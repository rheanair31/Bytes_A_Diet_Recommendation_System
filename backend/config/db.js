import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb://localhost:27017/Diet_Recommendation"
    )
    .then(() => console.log("DB connected"));
};
