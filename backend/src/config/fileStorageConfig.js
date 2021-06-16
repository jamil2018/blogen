import multer from "multer";
import path from "path";
import { v4 } from "uuid";

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FILE_UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, `${v4()}${path.extname(file.originalname)}`);
  },
});

export default fileStorageEngine;
