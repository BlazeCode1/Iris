const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const router = require("./router/router"); 
const app = express();
const PORT = 3000;

dotenv.config();

app.use(cors({
  origin: "http://localhost:8080", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
}));


app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use("/heatmaps", express.static(path.join(__dirname, "public", "heatmaps")));


app.use(router);

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to MongoDB!");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });