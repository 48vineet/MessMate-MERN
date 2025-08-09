const express = require('express');
const router = express.Router();
const { getMealHistory, getRecentMeals, getLastCompletedMeal } = require('../controllers/mealsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/history', getMealHistory);
router.get('/recent', getRecentMeals); // Add this route for recent meals
router.get('/last-completed', getLastCompletedMeal); // Add this route for last completed meal

module.exports = router;
