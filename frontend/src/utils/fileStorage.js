import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { getStorageController } from "../config/firebaseConfig";

const fileStorage = async (file) => {
  const storage = getStorageController(
    process.env.REACT_APP_FIREBASE_API_KEY,
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
  );
  const fileName = `${v4()}.${file.name.split(".")[1]}`;
  const storageRef = ref(storage, fileName);
  const uploadFile = async (storageRef, file) => {
    const uploadSnapshot = await uploadBytes(storageRef, file);
    return uploadSnapshot;
  };
  const getFileDownloadUrl = async (uploadSnapshot) => {
    const downloadUrl = await getDownloadURL(uploadSnapshot.ref);
    return downloadUrl;
  };
  const uploadSnapshot = await uploadFile(storageRef, file);
  const fileDownloadUrl = await getFileDownloadUrl(uploadSnapshot);

  return [fileName, fileDownloadUrl];
};

export default fileStorage;
