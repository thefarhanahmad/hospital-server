const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary"); // Ensure the Cloudinary configuration is correct

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Cloudinary instance
  params: {
    folder: "doctors/documents", // Folder name in Cloudinary
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "pdf",
      "doc",
      "docx",
      "avif",
    ], // Allowed file formats
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
