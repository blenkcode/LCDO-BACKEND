var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
require("../models/connection");
const Artists = require("../models/artists");

const Merchs = require("../models/merchs");

//ARTISTS//

router.post("/addArtist", (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.json({ result: false, error: "All fields must be specified" });
  }
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ result: false, error: "Invalid ID format" });
  }
  Artists.findByIdAndDelete(id)
    .then((artist) => {
      if (!artist) {
        return res
          .status(404)
          .json({ result: false, error: "Artist not found" });
      } else {
        return res.status(200).json({
          result: true,
          success: "Artist successfully deleted",
          artist,
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression : ", error);
      return res.status(500).json({
        result: false,
        error: "An error occurred",
        details: error.message,
      });
    });
});

//MERCHANDSING//

router.post("/addMerch", (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.json({ result: false, error: "All fields must be specified" });
  }
  Merchs.findOne({ name: req.body.name }).then((data) => {
    if (data === null) {
      const newMerchs = new Merchs({
        name: req.body.name,
        img: req.body.img,
        price: req.body.price,
        description: req.body.description,
        sizes: req.body.sizes,
      });

      newMerchs.save().then((newDoc) => {
        res.json({
          result: true,
          merch: newDoc,

          success: "Merch successfully added",
        });
      });
    } else {
      // L'utilisateur existe déjà dans la base de données
      res.json({ result: false, error: "Merch already exists" });
    }
  });
});

router.get("/merchs", (req, res) => {
  Merchs.find()
    .then((data) => {
      if (!data) {
        return res
          .status(404)
          .json({ result: false, error: "Nothing to display" });
      }

      res.json({
        result: true,
        merchs: data,
      });
    })
    .catch((error) => {
      console.error("Error fetching Merchs:");
      res.status(500).json({ result: false });
    });
});

router.delete("/deleteMerch", (req, res) => {
  const id = req.body.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ result: false, error: "Invalid ID format" });
  }
  Merchs.findByIdAndDelete(id)
    .then((merch) => {
      if (!merch) {
        return res
          .status(404)
          .json({ result: false, error: "Merch not found" });
      } else {
        return res.status(200).json({
          result: true,
          success: "Merch successfully deleted",
          merch: merch,
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression : ", error);
      return res.status(500).json({
        result: false,
        error: "An error occurred",
        details: error.message,
      });
    });
});

module.exports = router;
