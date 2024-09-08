const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  pseudo: String,
  email: String,
  password: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
  token: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
