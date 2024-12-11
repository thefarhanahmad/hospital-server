const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "doctors/documents",
    allowed_formats: ["pdf", "doc", "docx", "jpg", "png", "webp", "avif"],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
