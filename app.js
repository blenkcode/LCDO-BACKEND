require("dotenv").config();
var express = require("express");

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");

var app = express();

// Import CORS
const cors = require("cors");

// Update the allowed origins to include only your frontend domain
const allowedOrigins = [
  "https://lcdo-three.vercel.app/", // Add your frontend domain here
  "http://localhost:3000", // For local development
];

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Enable credentials if needed
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Allowed methods
  optionsSuccessStatus: 204, // To support older browsers
};

app.use(cors(corsOptions)); // Enable CORS middleware

// Use logging, JSON parsing, and other middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Route handlers
app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/users", usersRouter);

module.exports = app;
