var express = require("express");

var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const mongoose = require("mongoose");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");

// Définir le schéma Zod pour la route signup
const signupSchema = z.object({
  pseudo: z
    .string()
    .min(2, { message: "Pseudo must be at least 2 characters long" }), // Valide que pseudo est une chaîne non vide
  email: z.string().email({ message: "Invalid email address " }), // Valide que l'email est correct
  password: z
    .string()
    .min(6, { message: " Password must be at least 6 characters long" }), // Exige un mot de passe d'au moins 6 caractères
});

const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address " }), // Valide que l'email est correct
  password: z
    .string()
    .min(6, { message: " Password must be at least 6 characters long" }), // Exige un mot de passe d'au moins 6 caractères
});
const JWT_SECRET =
  process.env.JWT_SECRET ||
  //inscription

  //connexion
  router.post("/signin", (req, res) => {
    // Valider les données du corps de la requête avec Zod
    const validation = signinSchema.safeParse(req.body);

    if (!validation.success) {
      return res.json({
        result: false,
        error: validation.error.errors[0].message,
      });
    }

    // Si la validation passe, poursuivre avec la connexion
    User.findOne({ email: req.body.email }).then((data) => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        const token = jwt.sign(
          { id: data._id, role: data.role }, // Payload
          JWT_SECRET, // Clé secrète
          { expiresIn: "24h" } // Expiration du token (1 heure ici)
        );
        res.json({
          result: true,
          success: "Successfully logged! ",
          user: data,
          token: token,
        });
      } else {
        res.json({ result: false, error: "User not found or wrong password" });
      }
    });
  });
router.post("/signup", (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.json({ result: false, error: "All fields must be specified" });
  }

  // Valider les données du corps de la requête avec Zod
  const validation = signupSchema.safeParse(req.body);

  if (!validation.success) {
    return res.json({
      result: false,
      error: validation.error.errors[0].message,
    });
  }
  const adminEmails = process.env.ADMIN_USERS.split(",");
  const isAdmin = adminEmails.includes(req.body.email);
  // Si la validation passe, poursuivre avec l'inscription
  User.findOne({ pseudo: req.body.pseudo, email: req.body.email }).then(
    (data) => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);

        const newUser = new User({
          pseudo: req.body.pseudo,
          email: req.body.email,
          password: hash,
          role: isAdmin ? "admin" : "user",
        });

        newUser.save().then((newDoc) => {
          const user = {
            pseudo: newDoc.pseudo,
            email: newDoc.email,
            role: newDoc.role,
            token: newDoc.token,
            id: newDoc._id,
            // D'autres champs si nécessaire
          };
          // Générer un JWT pour l'utilisateur
          const token = jwt.sign(
            { id: newDoc._id, role: newDoc.role }, // Payload
            JWT_SECRET, // Clé secrète
            { expiresIn: "24h" } // Expiration du token (1 heure ici)
          );
          res.json({
            result: true,
            user: user,
            token: token, // Renvoyer l'objet utilisateur ici
            success: "Successfully registered!",
          });
        });
      } else {
        // L'utilisateur existe déjà dans la base de données
        res.json({ result: false, error: "User already exists" });
      }
    }
  );
});
router.put("/updateCart", async (req, res) => {
  const { userId, merchId, size } = req.body;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const merchObjectId = new mongoose.Types.ObjectId(merchId);

    let cartItem = user.cart.find((item) => item.merchId.equals(merchObjectId));

    if (cartItem) {
      let sizeItem = cartItem.size.find((s) => s.size === size);

      if (sizeItem) {
        sizeItem.quantity += 1;
      } else {
        cartItem.size.push({ size, quantity: 1 });
      }
    } else {
      user.cart.push({
        merchId: merchId,
        size: [{ size, quantity: 1 }],
      });
    }

    await user.save();

    res.json({
      result: true,
      message: "Cart updated successfully",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/cart", async (req, res) => {
  const userId = req.query.userId; // Use req.query for GET requests

  try {
    // Find the user by ID and populate the "merchId" field in the "cart"
    const user = await User.findById(userId).populate("cart.merchId");

    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    res.json({
      result: true,
      cart: user.cart, // Return the populated cart
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ result: false, error: "Server error" });
  }
});
router.put("/removeFromCart", async (req, res) => {
  const { userId, merchId, size } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    // Find the cart item that matches the merchId
    const cartItem = user.cart.find(
      (item) => item.merchId.toString() === merchId
    );

    if (!cartItem) {
      return res
        .status(404)
        .json({ result: false, error: "Item not found in cart" });
    }

    // If the item has multiple sizes, remove only the specific size
    const sizeIndex = cartItem.size.findIndex((s) => s.size === size);

    if (sizeIndex === -1) {
      return res
        .status(404)
        .json({ result: false, error: "Size not found in cart" });
    }

    // Remove the specific size from the cart item
    cartItem.size.splice(sizeIndex, 1);

    // If no sizes are left for the item, remove the entire item from the cart
    if (cartItem.size.length === 0) {
      user.cart = user.cart.filter(
        (item) => item.merchId.toString() !== merchId
      );
    }

    // Save the updated user document
    await user.save();

    return res.json({
      result: true,
      message: "Item removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});
module.exports = router;
