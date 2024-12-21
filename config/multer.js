const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Set up Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hospital", // Folder where the images will be stored on Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"], // Only allow image formats
  },
});

const upload = multer({ storage });

module.exports = upload;
