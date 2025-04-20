import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";

// Create a new router instance
const foodRouter = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    // Create a unique filename by appending the current timestamp
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize multer with the defined storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
    const mimetype = filetypes.test(file.mimetype); // Check the file's MIME type
    const extname = filetypes.test(file.originalname.split(".").pop().toLowerCase()); // Check the file's extension

    if (mimetype && extname) {
      return cb(null, true); // Accept the file
    }
    cb("Error: File upload only supports the following filetypes - " + filetypes); // Reject the file
  },
});

// Define routes
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);

export default foodRouter;
