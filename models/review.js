const mongoose = require("mongoose");
const schema = mongoose.Schema;

const reviewSchema = new Schema({
  body: {
    type: String,
  },
  rating: {
    type: Number,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
