const MealPlan = require('../models/MealPlan');

// Generate a new meal plan
exports.generateMealPlan = async (req, res) => {
  try {
    // TODO: Implement meal plan generation logic
    // For now, we'll return a mock meal plan
    const mockMealPlan = {
      userProfile: req.body,
      mealPlan: {
        daily_targets: {
          daily_calories: 2000,
          protein_g: 150,
          carbs_g: 200,
          fat_g: 67
        },
        meals: {
          breakfast: {
            target_calories: 500,
            options: [
              {
                food_name: "Oatmeal with Berries",
                calories: 350,
                protein_g: 12,
                carbs_g: 60,
                fat_g: 8,
                fiber_g: 8,
                diet_type: "vegetarian",
                cuisine_type: "american",
                allergens: []
              }
            ]
          },
          lunch: {
            target_calories: 600,
            options: [
              {
                food_name: "Grilled Chicken Salad",
                calories: 450,
                protein_g: 35,
                carbs_g: 20,
                fat_g: 25,
                fiber_g: 6,
                diet_type: "regular",
                cuisine_type: "american",
                allergens: []
              }
            ]
          },
          dinner: {
            target_calories: 700,
            options: [
              {
                food_name: "Salmon with Quinoa",
                calories: 550,
                protein_g: 40,
                carbs_g: 45,
                fat_g: 20,
                fiber_g: 8,
                diet_type: "regular",
                cuisine_type: "american",
                allergens: []
              }
            ]
          },
          snack: {
            target_calories: 200,
            options: [
              {
                food_name: "Greek Yogurt with Nuts",
                calories: 200,
                protein_g: 15,
                carbs_g: 10,
                fat_g: 12,
                fiber_g: 3,
                diet_type: "regular",
                cuisine_type: "american",
                allergens: ["dairy"]
              }
            ]
          }
        },
        current_season: "summer",
        seasonal_recommendations: {
          breakfast: [{ food_name: "Fresh Fruit Smoothie" }],
          lunch: [{ food_name: "Grilled Vegetable Wrap" }],
          dinner: [{ food_name: "Grilled Fish with Summer Vegetables" }],
          snack: [{ food_name: "Fresh Berries" }]
        }
      }
    };

    res.status(200).json(mockMealPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error generating meal plan', error: error.message });
  }
};

// Save a meal plan
exports.saveMealPlan = async (req, res) => {
  try {
    const mealPlan = new MealPlan(req.body);
    await mealPlan.save();
    res.status(201).json(mealPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error saving meal plan', error: error.message });
  }
};

// Get all saved meal plans
exports.getSavedMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find().sort({ createdAt: -1 });
    res.status(200).json(mealPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving meal plans', error: error.message });
  }
};

// Delete a saved meal plan
exports.deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findByIdAndDelete(req.params.id);
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    res.status(200).json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meal plan', error: error.message });
  }
}; 