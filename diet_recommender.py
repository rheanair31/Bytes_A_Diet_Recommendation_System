import pandas as pd
import numpy as np
import joblib
import re
import json
from datetime import datetime

class DietRecommendationApp:
    """
    A standalone diet recommendation system that uses pre-trained models
    to provide personalized meal plans based on user profiles.
    """

    def __init__(self, food_data_path, models_dir="./"):
        """
        Initialize the recommendation system by loading the food database and model files.

        Parameters:
        -----------
        food_data_path : str
            Path to the food database CSV file
        models_dir : str
            Directory containing the pickled model files
        """
        # Load the food database
        self.food_df = pd.read_csv(food_data_path)
        
        # Load models and encoders
        try:
            self.encoder = joblib.load(f"{models_dir}/food_encoder.pkl")
            self.scaler = joblib.load(f"{models_dir}/food_scaler.pkl")
            self.kmeans = joblib.load(f"{models_dir}/food_clusters.pkl")

            # Load meal type predictors
            self.meal_predictors = {}
            for meal_type in ['breakfast', 'lunch', 'dinner', 'snack']:
                self.meal_predictors[meal_type] = joblib.load(f"{models_dir}/{meal_type}_predictor.pkl")
        except FileNotFoundError as e:
            print(f"Error loading model files: {e}")
            print("Make sure you've run the training code first to generate the model files.")
            raise

        # Load similarity matrix if available, otherwise compute it
        try:
            self.similarity_matrix = joblib.load(f"{models_dir}/similarity_matrix.pkl")
        except FileNotFoundError:
            self.similarity_matrix = self._compute_similarity_matrix()
            joblib.dump(self.similarity_matrix, f"{models_dir}/similarity_matrix.pkl")

    def _compute_similarity_matrix(self):
        """Compute similarity matrix based on nutritional values"""
        from sklearn.metrics.pairwise import cosine_similarity

        # Get features that were used for scaling
        scaler_features = self.scaler.feature_names_in_

        # Check which of those features are in our dataframe
        valid_cols = [col for col in scaler_features if col in self.food_df.columns]
        missing_cols = [col for col in scaler_features if col not in self.food_df.columns]

        if missing_cols:
            # Add missing columns with default values (0)
            for col in missing_cols:
                self.food_df[col] = 0

        # Create a dataframe with all the necessary columns in the same order as during training
        features_df = self.food_df[scaler_features].copy()

        # Scale the features
        features = self.scaler.transform(features_df)

        # Compute cosine similarity
        similarity = cosine_similarity(features)

        return similarity

    def calculate_bmr(self, age, sex, weight_kg, height_cm, activity_level):
        """Calculate Basal Metabolic Rate using the Mifflin-St Jeor Equation"""
        # Mifflin-St Jeor Equation
        if sex.lower() == 'male':
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        else:  # female
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

        # Apply activity factor
        activity_factors = {
            'sedentary': 1.2,      # Little or no exercise
            'light': 1.375,        # Light exercise 1-3 days/week
            'moderate': 1.55,      # Moderate exercise 3-5 days/week
            'active': 1.725,       # Hard exercise 6-7 days/week
            'very_active': 1.9     # Very hard exercise & physical job or 2x training
        }

        factor = activity_factors.get(activity_level.lower(), 1.2)
        tdee = bmr * factor

        return {
            'bmr': round(bmr),
            'tdee': round(tdee),
            'weight_loss': round(tdee * 0.8),  # 20% deficit
            'weight_gain': round(tdee * 1.15), # 15% surplus
            'maintenance': round(tdee)
        }

    def recommend_goal(self, age, sex, weight_kg, height_cm):
        """Recommend a goal based on user's BMI and other health factors"""
        # Calculate BMI
        height_m = height_cm / 100
        bmi = weight_kg / (height_m * height_m)

        # Recommend goal based on BMI ranges
        if bmi < 18.5:
            return 'gain_weight', f"Based on your BMI of {bmi:.1f}, which is classified as underweight, we recommend a weight gain goal to reach a healthier weight. This would help improve overall health and energy levels."
        elif bmi >= 25:
            return 'lose_weight', f"Based on your BMI of {bmi:.1f}, which is classified as overweight, we recommend a weight loss goal to reach a healthier weight. This could help reduce health risks and improve overall wellbeing."
        else:
            return 'maintain', f"Based on your BMI of {bmi:.1f}, which is in the healthy range, we recommend a weight maintenance goal. This will help you sustain your current healthy weight while focusing on nutrition quality."

    def get_user_calorie_targets(self, user_profile):
        """Calculate calorie and macronutrient targets based on user's profile and goal"""
        # Calculate BMR and calorie targets
        calorie_info = self.calculate_bmr(
            user_profile['age'],
            user_profile['sex'],
            user_profile['weight_kg'],
            user_profile['height_cm'],
            user_profile['activity_level']
        )

        # Set targets based on goal
        if user_profile['goal'] == 'lose_weight':
            calorie_target = calorie_info['weight_loss']
        elif user_profile['goal'] == 'gain_weight':
            calorie_target = calorie_info['weight_gain']
        else:  # maintain
            calorie_target = calorie_info['maintenance']

        # Calculate macronutrient targets
        protein_target = user_profile['weight_kg'] * 1.6  # g protein per kg
        fat_target = (calorie_target * 0.25) / 9  # 25% calories from fat
        carb_target = (calorie_target - (protein_target * 4 + fat_target * 9)) / 4

        return {
            'bmr': calorie_info['bmr'],
            'tdee': calorie_info['tdee'],
            'daily_calories': calorie_target,
            'protein_g': round(protein_target),
            'fat_g': round(fat_target),
            'carbs_g': round(carb_target)
        }

    def filter_foods_by_constraints(self, diet_type, meal_type, season, cuisines=None, allergens=None):
        """Filter foods based on user constraints with error handling and fallbacks"""
        # Start with all foods
        filtered_df = self.food_df.copy()

        # Filter by diet type if specified
        if diet_type:
            diet_mask = filtered_df['diet_type'] == diet_type
            if diet_mask.sum() > 0:
                filtered_df = filtered_df[diet_mask]
            else:
                # Try case-insensitive match
                diet_mask = filtered_df['diet_type'].str.lower() == diet_type.lower()
                if diet_mask.sum() > 0:
                    filtered_df = filtered_df[diet_mask]

        # Filter by meal type if specified
        if meal_type:
            column = f'suitable_{meal_type.lower()}'
            if column in filtered_df.columns:
                meal_mask = filtered_df[column] == 1
                if meal_mask.sum() > 0:
                    filtered_df = filtered_df[meal_mask]

        # Filter by season if specified
        if season and season in filtered_df.columns:
            season_mask = filtered_df[season] == 1
            if season_mask.sum() > 0:
                filtered_df = filtered_df[season_mask]

        # Filter by cuisine type if specified
        if cuisines and len(cuisines) > 0 and 'cuisine_type' in filtered_df.columns:
            cuisine_mask = filtered_df['cuisine_type'].isin(cuisines)
            if cuisine_mask.sum() > 0:
                filtered_df = filtered_df[cuisine_mask]

        # Filter by allergens if specified
        if allergens and len(allergens) > 0 and 'allergens' in filtered_df.columns:
            for allergen in allergens:
                if not allergen or allergen.strip() == '':
                    continue

                # Check if allergens column is string type
                if filtered_df['allergens'].dtype == 'object':
                    allergen_mask = filtered_df['allergens'].notna() & filtered_df['allergens'].str.contains(
                        re.escape(allergen.strip()), case=False, na=False)
                    filtered_df = filtered_df[~allergen_mask]

        # If no foods remain after filtering, implement fallback strategy
        if len(filtered_df) == 0:
            # Fallback 1: Try without cuisine constraint
            if cuisines and len(cuisines) > 0:
                fallback_df = self.filter_foods_by_constraints(
                    diet_type=diet_type,
                    meal_type=meal_type,
                    season=season,
                    cuisines=None,
                    allergens=allergens
                )
                if len(fallback_df) > 0:
                    return fallback_df

            # Fallback 2: Try without meal type constraint
            if meal_type:
                fallback_df = self.filter_foods_by_constraints(
                    diet_type=diet_type,
                    meal_type=None,
                    season=season,
                    cuisines=cuisines,
                    allergens=allergens
                )
                if len(fallback_df) > 0:
                    return fallback_df

            # Fallback 3: Try without season constraint
            if season:
                fallback_df = self.filter_foods_by_constraints(
                    diet_type=diet_type,
                    meal_type=meal_type,
                    season=None,
                    cuisines=cuisines,
                    allergens=allergens
                )
                if len(fallback_df) > 0:
                    return fallback_df

            # Fallback 4: Try with just diet type and allergens
            if diet_type and allergens:
                fallback_df = self.food_df.copy()

                # Apply diet type filter
                diet_mask = fallback_df['diet_type'] == diet_type
                fallback_df = fallback_df[diet_mask]

                # Apply allergen filter
                if 'allergens' in fallback_df.columns:
                    for allergen in allergens:
                        if allergen.strip() == '':
                            continue
                        allergen_mask = fallback_df['allergens'].notna() & fallback_df['allergens'].str.contains(
                            re.escape(allergen), case=False, na=False)
                        fallback_df = fallback_df[~allergen_mask]

                if len(fallback_df) > 0:
                    return fallback_df

            # Final fallback: Return any foods that don't contain allergens
            fallback_df = self.food_df.copy()

            if allergens and 'allergens' in fallback_df.columns:
                for allergen in allergens:
                    if allergen.strip() == '':
                        continue
                    allergen_mask = fallback_df['allergens'].notna() & fallback_df['allergens'].str.contains(
                        re.escape(allergen), case=False, na=False)
                    fallback_df = fallback_df[~allergen_mask]

            if len(fallback_df) > 0:
                return fallback_df.head(10)  # Return at least some options

            # If all else fails, return the first 10 items from the original database
            return self.food_df.sample(min(10, len(self.food_df)))

        return filtered_df

    def get_similar_foods(self, food_id, top_n=5):
        """Find similar foods based on similarity matrix"""
        # Get index of the food
        food_indices = self.food_df.index[self.food_df['food_id'] == food_id].tolist()

        if not food_indices:
            return []

        idx = food_indices[0]

        # Get similarity scores
        similarity_scores = list(enumerate(self.similarity_matrix[idx]))

        # Sort by similarity (exclude itself)
        similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)[1:top_n+1]

        # Get food details
        similar_foods = []
        for i, score in similarity_scores:
            food = self.food_df.iloc[i]
            similar_foods.append({
                'food_id': food['food_id'],
                'food_name': food['food_name'],
                'similarity': score,
                'calories': food['calories'],
                'protein_g': food['protein_g'],
                'diet_type': food['diet_type']
            })

        return similar_foods

    def determine_current_season(self):
        """Determine the current season based on date"""
        # Get current month
        month = datetime.now().month

        # Determine season (Northern Hemisphere)
        if 3 <= month <= 5:
            return 'spring'
        elif 6 <= month <= 8:
            return 'summer'
        elif 9 <= month <= 11:
            return 'fall'
        else:
            return 'winter'

    def recommend_daily_meals(self, user_profile):
        """Generate complete meal recommendations for a day"""
        # Calculate targets
        targets = self.get_user_calorie_targets(user_profile)

        # Determine current season if not specified
        season = user_profile.get('season')
        if not season:
            season = self.determine_current_season()

        # Meal distribution (percentage of daily calories)
        meal_distribution = {
            'breakfast': 0.25,
            'lunch': 0.35,
            'dinner': 0.30,
            'snack': 0.10
        }

        allergens = user_profile.get('allergies', [])
        diet_type = user_profile.get('diet_type', None)
        cuisines = user_profile.get('cuisines', {})

        daily_meals = {}

        # Generate recommendations for each meal
        for meal, percentage in meal_distribution.items():
            meal_calories = targets['daily_calories'] * percentage

            # Get cuisines specific to this meal if available
            meal_cuisines = cuisines.get(meal, None)

            # Filter suitable foods
            suitable_foods = self.filter_foods_by_constraints(
                diet_type=diet_type,
                meal_type=meal,
                season=season,
                cuisines=meal_cuisines,
                allergens=allergens
            )

            if len(suitable_foods) == 0:
                daily_meals[meal] = {"error": f"No suitable {meal} options found with your constraints"}
                continue

            # Sort by how close they are to the target calories
            suitable_foods['calorie_diff'] = abs(suitable_foods['calories'] - meal_calories)
            suitable_foods = suitable_foods.sort_values('calorie_diff')

            # Take top 3 options
            top_options = suitable_foods.head(3).to_dict('records')

            daily_meals[meal] = {
                'target_calories': round(meal_calories),
                'options': top_options
            }

        return {
            'daily_targets': targets,
            'current_season': season,
            'meals': daily_meals
        }
    
    def get_seasonal_recommendations(self, diet_type=None, meal_type=None, cuisines=None):
        """Get food recommendations for the current season"""
        season = self.determine_current_season()
        
        filtered_foods = self.filter_foods_by_constraints(
            diet_type=diet_type,
            meal_type=meal_type,
            season=season,
            cuisines=cuisines
        )
        
        # Sort by nutritional value (protein to calorie ratio as an example)
        if 'protein_g' in filtered_foods.columns and 'calories' in filtered_foods.columns:
            filtered_foods['protein_ratio'] = filtered_foods['protein_g'] / filtered_foods['calories'].replace(0, 1)
            filtered_foods = filtered_foods.sort_values('protein_ratio', ascending=False)
        
        return {
            'season': season,
            'foods': filtered_foods.head(10).to_dict('records')
        }

    def save_meal_plan(self, meal_plan, filename=None):
        """Save a meal plan to a JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"meal_plan_{timestamp}.json"

        # Convert to serializable format
        serializable_plan = self._make_serializable(meal_plan)

        with open(filename, 'w') as f:
            json.dump(serializable_plan, f, indent=2)

        return filename

    def _make_serializable(self, obj):
        """Convert numpy types to Python native types for JSON serialization"""
        if isinstance(obj, dict):
            return {key: self._make_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._make_serializable(item) for item in obj]
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return obj


# Usage with dynamic user input
if __name__ == "__main__":
    try:
        # Initialize the recommendation system
        recommender = DietRecommendationApp(
            food_data_path="seasonal_food_database.csv",
            models_dir="./"
        )

        print("\nWelcome to the Diet Recommendation App!")
        print("Please enter your information to get personalized meal recommendations.")

        # Get user profile through input
        age = int(input("Enter your age: "))
        sex = input("Enter your sex (male/female): ").lower()
        weight = float(input("Enter your weight in kg: "))
        height = float(input("Enter your height in cm: "))

        print("\nActivity levels:")
        print("1. Sedentary (little or no exercise)")
        print("2. Light (light exercise 1-3 days/week)")
        print("3. Moderate (moderate exercise 3-5 days/week)")
        print("4. Active (hard exercise 6-7 days/week)")
        print("5. Very Active (very hard exercise & physical job)")

        activity_choice = int(input("Choose your activity level (1-5): "))
        activity_levels = ['sedentary', 'light', 'moderate', 'active', 'very_active']
        activity_level = activity_levels[activity_choice - 1]

        # Generate goal recommendation based on BMI
        recommended_goal, recommendation_reason = recommender.recommend_goal(age, sex, weight, height)

        print("\n--- Goal Recommendation ---")
        print(recommendation_reason)

        print("\nGoals:")
        print(f"1. Lose weight {' (Recommended)' if recommended_goal == 'lose_weight' else ''}")
        print(f"2. Maintain weight {' (Recommended)' if recommended_goal == 'maintain' else ''}")
        print(f"3. Gain weight {' (Recommended)' if recommended_goal == 'gain_weight' else ''}")

        goal_choice = int(input("Choose your goal (1-3): "))
        goals = ['lose_weight', 'maintain', 'gain_weight']
        goal = goals[goal_choice - 1]

        print("\nDiet types:")
        print("1. Regular (omnivore)")
        print("2. Vegetarian")
        print("3. Vegan")

        diet_choice = int(input("Choose your diet type (1-3): "))
        diet_types = ['Regular', 'Vegetarian', 'Vegan']
        diet_type = diet_types[diet_choice - 1]

        # Get cuisine preferences for each meal
        cuisine_options = ['Spanish', 'Korean', 'Mexican', 'Lebanese', 'Thai', 'Chinese', 
                          'Italian', 'Greek', 'French', 'Vietnamese', 'American', 
                          'Japanese', 'Indian', 'Fruit']
        
        print("\nCuisine options:")
        for i, cuisine in enumerate(cuisine_options, 1):
            print(f"{i}. {cuisine}")
        
        meal_cuisines = {}
        for meal in ['breakfast', 'lunch', 'dinner','snack']:
            print(f"\nSelect cuisine preferences for {meal} (enter numbers separated by commas, or 0 for any):")
            cuisine_input = input("> ")
            
            if cuisine_input.strip() == '0' or not cuisine_input.strip():
                meal_cuisines[meal] = None
            else:
                # Parse selected cuisines
                try:
                    selected_indices = [int(x.strip()) - 1 for x in cuisine_input.split(',') if x.strip()]
                    selected_cuisines = [cuisine_options[i] for i in selected_indices if 0 <= i < len(cuisine_options)]
                    meal_cuisines[meal] = selected_cuisines if selected_cuisines else None
                except (ValueError, IndexError):
                    print("Invalid input, using all cuisines for this meal.")
                    meal_cuisines[meal] = None

        # Get allergies
        allergies_input = input("\nEnter any allergies separated by commas (or press Enter for none): ")
        allergies = [allergy.strip() for allergy in allergies_input.split(',')] if allergies_input else []

        # Create user profile
        user = {
            'age': age,
            'sex': sex,
            'weight_kg': weight,
            'height_cm': height,
            'activity_level': activity_level,
            'goal': goal,
            'diet_type': diet_type,
            'cuisines': meal_cuisines,
            'allergies': allergies
        }

        # Generate daily recommendations
        print("\nGenerating daily meal recommendations...")
        daily_plan = recommender.recommend_daily_meals(user)

        # Print the results
        print("\n--- Your Calorie Targets ---")
        print(f"BMR: {daily_plan['daily_targets']['bmr']} calories")
        print(f"TDEE: {daily_plan['daily_targets']['tdee']} calories")
        print(f"Daily target: {daily_plan['daily_targets']['daily_calories']} calories")
        print(f"Protein: {daily_plan['daily_targets']['protein_g']}g")
        print(f"Fat: {daily_plan['daily_targets']['fat_g']}g")
        print(f"Carbs: {daily_plan['daily_targets']['carbs_g']}g")

        # Print meal recommendations with complete macros
        for meal_type in ['breakfast', 'lunch', 'dinner', 'snack']:
            meal_data = daily_plan['meals'].get(meal_type)
            if meal_data and 'options' in meal_data and meal_data['options']:
                print(f"\n--- {meal_type.capitalize()} ---")
                print(f"Target calories: {meal_data['target_calories']}")

                for i, option in enumerate(meal_data['options'], 1):
                    print(f"\nOption {i}: {option['food_name']}")
                    print(f"  Calories: {option['calories']}")
                    print(f"  Protein: {option.get('protein_g', 'N/A')}g")
                    print(f"  Fat: {option.get('fat_g', 'N/A')}g")  # Added fat
                    print(f"  Carbs: {option.get('carbs_g', 'N/A')}g")  # Added carbs
                    print(f"  Diet type: {option.get('diet_type', 'N/A')}")
                    print(f"  Cuisine: {option.get('cuisine_type', 'N/A')}")
            elif meal_data and 'error' in meal_data:
                print(f"\n--- {meal_type.capitalize()} ---")
                print(meal_data['error'])

        # NEW PLACEMENT: Get current season and ask for seasonal recommendations
        current_season = recommender.determine_current_season()
        print(f"\nCurrent season is: {current_season.capitalize()}")
        
        # Ask if the user wants seasonal recommendations
        seasonal_choice = input("\nWould you like to see seasonal food recommendations? (y/n): ")
        
        # Show seasonal recommendations if the user wants them
        if seasonal_choice.lower() == 'y':
            print(f"\nTop seasonal recommendations for {current_season.capitalize()}:")
            for meal_type in ['breakfast', 'lunch', 'dinner', 'snack']:
                seasonal_items = recommender.get_seasonal_recommendations(
                    diet_type=diet_type,
                    meal_type=meal_type,
                    cuisines=meal_cuisines.get(meal_type)
                )
                
                print(f"\nBest {meal_type.capitalize()} items for {current_season.capitalize()}:")
                for i, food in enumerate(seasonal_items['foods'][:3], 1):
                    print(f"  {i}. {food['food_name']} ({food.get('cuisine_type', 'N/A')})")
                    print(f"     Calories: {food.get('calories', 'N/A')}, " 
                          f"Protein: {food.get('protein_g', 'N/A')}g, "
                          f"Fat: {food.get('fat_g', 'N/A')}g, "  # Added fat
                          f"Carbs: {food.get('carbs_g', 'N/A')}g")  # Added carbs

        # Option to save the meal plan
        save_option = input("\nWould you like to save the meal plan to a file? (y/n): ")
        if save_option.lower() == 'y':
            filename = recommender.save_meal_plan(daily_plan)
            print(f"Meal plan saved to {filename}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

        