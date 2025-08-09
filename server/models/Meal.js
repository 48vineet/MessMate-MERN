const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  mealName: String,
  mealType: String,
  status: String,
  date: Date,
  bookedAt: Date,
  price: Number,
  userRating: Number,
  feedback: String,
  items: [{ name: String }]
});

module.exports = mongoose.model('Meal', mealSchema);
