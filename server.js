require("dotenv").config({ path: "./.env" });
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const connectDB = require("./configs/db");
const app = express();

const origin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.FRONTEND;

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin,
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use("/api", require("./routes/authRouter"));
app.use("/api", require("./routes/product"));
app.use("/api", require("./routes/user"));

app.use((err, _, res, __) => {
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong, please try again.",
  });
});
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.listen(PORT, function (err) {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", PORT);
});

connectDB();
