import multer from "multer";
import fileStorageEngine from "../config/fileStorageConfig.js";

const uploads = multer({ storage: fileStorageEngine });

export { uploads };
