const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  userProfile: {
    age: { type: Number, required: true },
    sex: { type: String, required: true },
    weight_kg: { type: Number, required: true },
    height_cm: { type: Number, required: true },
    activity_level: { type: String, required: true },
    goal: { type: String, required: true },
    diet_type: { type: String, required: true },
    allergies: [String],
    cuisines: {
      breakfast: [String],
      lunch: [String],
      dinner: [String],
      snack: [String]
    }
  },
  mealPlan: {
    daily_targets: {
      daily_calories: { type: Number, required: true },
      protein_g: { type: Number, required: true },
      carbs_g: { type: Number, required: true },
      fat_g: { type: Number, required: true }
    },
    meals: {
      breakfast: {
        target_calories: Number,
        options: [{
          food_name: String,
          calories: Number,
          protein_g: Number,
          carbs_g: Number,
          fat_g: Number,
          fiber_g: Number,
          diet_type: String,
          cuisine_type: String,
          allergens: [String]
        }]
      },
      lunch: {
        target_calories: Number,
        options: [{
          food_name: String,
          calories: Number,
          protein_g: Number,
          carbs_g: Number,
          fat_g: Number,
          fiber_g: Number,
          diet_type: String,
          cuisine_type: String,
          allergens: [String]
        }]
      },
      dinner: {
        target_calories: Number,
        options: [{
          food_name: String,
          calories: Number,
          protein_g: Number,
          carbs_g: Number,
          fat_g: Number,
          fiber_g: Number,
          diet_type: String,
          cuisine_type: String,
          allergens: [String]
        }]
      },
      snack: {
        target_calories: Number,
        options: [{
          food_name: String,
          calories: Number,
          protein_g: Number,
          carbs_g: Number,
          fat_g: Number,
          fiber_g: Number,
          diet_type: String,
          cuisine_type: String,
          allergens: [String]
        }]
      }
    },
    current_season: { type: String, required: true },
    seasonal_recommendations: {
      breakfast: [{ food_name: String }],
      lunch: [{ food_name: String }],
      dinner: [{ food_name: String }],
      snack: [{ food_name: String }]
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MealPlan', mealPlanSchema); 