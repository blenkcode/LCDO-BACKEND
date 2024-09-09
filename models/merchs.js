const mongoose = require("mongoose");

// Schéma pour la gestion des tailles et quantités
const TailleSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ["Unique size", "S", "M", "L", "XL"], // Accepte "Unique size"
  },
  quantity: {
    type: Number,
    required: true,
    min: 0, // La quantité disponible doit être au moins 0
  },
});

// Schéma principal pour l'article de merchandising
const merchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sizes: [TailleSchema],
});

// Modèle Mongoose
const Merchs = mongoose.model("Merchs", merchSchema);

module.exports = Merchs;
