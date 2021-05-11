import express from "express";
import dotenv from "dotenv";
import colors from "colors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// middlewares
app.use(express.json());

// routes
app.use("/", (req, res) => {
  res.status(200).json({ message: "hello world" });
});

// start
app.listen(PORT, () => {
  console.log(
    `Server has started in ${process.env.NODE_ENV} mode on PORT:${PORT}`.bgGreen
      .black
  );
});
