const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');

// Generate a new meal plan
router.post('/generate', mealPlanController.generateMealPlan);

// Save a meal plan
router.post('/save', mealPlanController.saveMealPlan);

// Get all saved meal plans
router.get('/saved', mealPlanController.getSavedMealPlans);

// Delete a saved meal plan
router.delete('/saved/:id', mealPlanController.deleteMealPlan);

module.exports = router; 