import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import helmet from "helmet";
import morgan from "morgan";

import dbConfig from "./src/config/dbConfig.js";
import usersRoute from "./src/routes/usersRoute.js";
import categoriesRoute from "./src/routes/categoriesRoute.js";
import postsRoute from "./src/routes/postsRoute.js";
import { errorHandler, notFound } from "./src/middlewares/errorMiddleware.js";

dotenv.config();
dbConfig();

const app = express();
const PORT = process.env.PORT;

// middlewares
app.use(express.json());
app.use(helmet());
if (process.env.NODE_ENV === "DEVELOPMENT") app.use(morgan("dev"));

// routes
app.use("/api/users", usersRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/posts", postsRoute);
app.use(notFound);
app.use(errorHandler);

// start
app.listen(PORT, () => {
  console.log(
    `Server has started in ${process.env.NODE_ENV} mode on PORT:${PORT}`.bgGreen
      .black
  );
});
