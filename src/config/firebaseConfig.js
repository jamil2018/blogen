import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const getStorageController = (apiKey, authDomain, storageBucket) => {
  const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    storageBucket: storageBucket,
  };
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  return storage;
};

export { getStorageController };
