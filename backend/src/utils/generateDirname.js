import path from "path";
import { fileURLToPath } from "url";

const getDirname = () => {
  path.dirname(fileURLToPath(import.meta.url));
};

export { getDirname };
