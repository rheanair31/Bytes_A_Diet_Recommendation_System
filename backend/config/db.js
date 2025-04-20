import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://vedanshsavla:CkxJPk7DIcMHiBm6@cluster0.5qghp.mongodb.net/food-del"
    )
    .then(() => console.log("DB connected"));
};
