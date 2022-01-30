import base64 from "base-64";

export const toBase64 = (arr) => {
  return base64.encode(
    arr.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
};

export const getBase64ImageURL = (arr) => {
  return `data:image/*;base64,${toBase64(arr)}`;
};
