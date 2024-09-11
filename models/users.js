const mongoose = require("mongoose");
const { Schema } = mongoose; // Destructure Schema from mongoose

const userSchema = new Schema({
  pseudo: String,
  email: String,
  password: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
  token: String,
  cart: [
    {
      merchId: { type: Schema.Types.ObjectId, ref: "Merchs" }, // Use Schema here

      size: [
        { quantity: { type: Number, default: 0 }, size: { type: String } },
      ],
    },
  ],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
