const mongoose = require("mongoose");

const artistsSchema = mongoose.Schema({
  name: String,
  img: String,
  ig: String,
  sc: String,
  stage: String,
  day: String,
});

const Artists = mongoose.model("artist", artistsSchema);

module.exports = Artists;
