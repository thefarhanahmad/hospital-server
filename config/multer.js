const multer = require("multer");

const fs =require("fs")
const path=require("path")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads"); // Local directory for file storage
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // Create the directory if it doesn't exist
    }
    cb(null, uploadPath); // Store files locally in the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name with timestamp
  },
});
const upload = multer({ storage });

module.exports = upload;
