var express = require("express");

var router = express.Router();

require("../models/connection");
const User = require("../models/users");
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

module.exports = router;
