var express = require("express");

var router = express.Router();
const mongoose = require("mongoose");
require("../models/connection");
const Artists = require("../models/artists");

// Définir le schéma Zod pour la route signup

router.post("/addArtist", (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.json({ result: false, error: "All fields must be specified" });
  }

  // Valider les données du corps de la requête avec Zod

  // Si la validation passe, poursuivre avec l'inscription
  Artists.findOne({ name: req.body.name }).then((data) => {
    if (data === null) {
      const newArtist = new Artists({
        name: req.body.name,
        img: req.body.img,
        sc: req.body.sc,
        ig: req.body.ig,
        stage: req.body.stage,
        day: req.body.day,
      });

      newArtist.save().then((newDoc) => {
        res.json({
          result: true,
          artist: newDoc,

          success: "Artist successfully added",
        });
      });
    } else {
      // L'utilisateur existe déjà dans la base de données
      res.json({ result: false, error: "Artist already exists" });
    }
  });
});

router.get("/artists", (req, res) => {
  Artists.find()
    .then((data) => {
      if (!data) {
        return res
          .status(404)
          .json({ result: false, error: "Nothing to display" });
      }

      res.json({
        result: true,
        artists: data,
      });
    })
    .catch((error) => {
      console.error("Error fetching Artists:");
      res.status(500).json({ result: false });
    });
});

router.delete("/deleteArtist", (req, res) => {
  const id = req.body.id;

  // Vérifiez que l'ID est bien un ObjectId valide
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ result: false, error: "Invalid ID format" });
  }

  // Trouver et supprimer l'artiste en une seule opération
  Artists.findByIdAndDelete(id)
    .then((artist) => {
      if (!artist) {
        return res
          .status(404)
          .json({ result: false, error: "Artist not found" });
      } else {
        return res
          .status(200)
          .json({
            result: true,
            success: "Artist successfully deleted",
            artist,
          });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression : ", error); // Log de l'erreur
      return res.status(500).json({
        result: false,
        error: "An error occurred",
        details: error.message,
      });
    });
});
module.exports = router;
