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
  "https://lcdo-three.vercel.app", // Your frontend domain on Vercel
  "http://localhost:3000", // Local development
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman) and requests from allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials (e.g., cookies, headers)
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Allowed HTTP methods
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Use CORS middleware with the configured options
app.use(cors(corsOptions));
// Enable CORS middleware
app.options("*", cors(corsOptions));
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
