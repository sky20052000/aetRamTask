const multer = require("multer");
const path = require("path");
const fs  = require("fs");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const baseDir = path.join(__dirname, '/../uploads/Csv/');
      
      // Ensure the directories exist before storing files
      if (!fs.existsSync(path.join(__dirname, '/../uploads/'))) {
        fs.mkdirSync(path.join(__dirname, '/../uploads/'));
      }
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
      }
      cb(null, baseDir);  // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Save file with timestamp prefix
    },
  });
  
  // Initialize multer with storage options
  const upload = multer({ storage: storage });
  module.exports = upload