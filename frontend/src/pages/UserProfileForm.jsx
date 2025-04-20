import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, ProgressBar, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfileForm = ({ setUserProfile, setMealPlan }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    age: '',
    sex: 'male',
    weight_kg: '',
    height_cm: '',
    activity_level: 'moderate',
    goal: '',
    diet_type: 'Regular',
    allergies: '',
    cuisines: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    }
  });

  const cuisineOptions = [
    'Spanish', 'Korean', 'Mexican', 'Lebanese', 'Thai', 'Chinese', 
    'Italian', 'Greek', 'French', 'Vietnamese', 'American', 
    'Japanese', 'Indian', 'Fruit'
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Light (light exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (moderate exercise 3-5 days/week)' },
    { value: 'active', label: 'Active (hard exercise 6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (very hard exercise & physical job)' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCuisineChange = (meal, cuisine) => {
    setFormData(prevData => {
      const updatedCuisines = { ...prevData.cuisines };
      
      if (updatedCuisines[meal].includes(cuisine)) {
        // Remove if already selected
        updatedCuisines[meal] = updatedCuisines[meal].filter(c => c !== cuisine);
      } else {
        // Add if not selected
        updatedCuisines[meal] = [...updatedCuisines[meal], cuisine];
      }
      
      return {
        ...prevData,
        cuisines: updatedCuisines
      };
    });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Process allergies string into array
      const processedFormData = {
        ...formData,
        allergies: formData.allergies.split(',').map(item => item.trim()).filter(item => item !== '')
      };

      setUserProfile(processedFormData);
      
      // Send data to backend
      const response = await axios.post('/api/meal-plan', processedFormData);
      
      setMealPlan(response.data);
      setLoading(false);
      navigate('/meal-plan');
    } catch (err) {
      setLoading(false);
      setError('There was an error generating your meal plan. Please try again.');
      console.error('Error submitting form:', err);
    }
  };

  const calculateBMI = () => {
    if (formData.weight_kg && formData.height_cm) {
      const heightM = formData.height_cm / 100;
      return (formData.weight_kg / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'warning' };
    if (bmi < 25) return { category: 'Normal', color: 'success' };
    if (bmi < 30) return { category: 'Overweight', color: 'warning' };
    return { category: 'Obese', color: 'danger' };
  };

  const getRecommendedGoal = () => {
    const bmi = calculateBMI();
    if (!bmi) return null;
    
    if (bmi < 18.5) return 'gain_weight';
    if (bmi >= 25) return 'lose_weight';
    return 'maintain';
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h4 className="mb-4">Basic Information</h4>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Age</Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="1"
                    max="120"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sex</Form.Label>
                  <Form.Select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    required
                    step="0.1"
                    min="20"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleChange}
                    required
                    min="50"
                  />
                </Form.Group>
              </Col>
            </Row>

            {calculateBMI() && (
              <Card className="mb-4 mt-2">
                <Card.Body>
                  <h5>BMI: {calculateBMI()}</h5>
                  <p className={`text-${getBMICategory(calculateBMI()).color}`}>
                    {getBMICategory(calculateBMI()).category}
                  </p>
                </Card.Body>
              </Card>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Activity Level</Form.Label>
              <Form.Select
                name="activity_level"
                value={formData.activity_level}
                onChange={handleChange}
              >
                {activityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" onClick={nextStep}>
                Next <i className="fas fa-arrow-right ms-1"></i>
              </Button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h4 className="mb-4">Goals and Diet Preferences</h4>
            
            <Form.Group className="mb-4">
              <Form.Label>Your Goal</Form.Label>
              <div className="mb-2">
                {getRecommendedGoal() && (
                  <small className="text-muted">
                    Based on your BMI, we recommend: <strong>{getRecommendedGoal() === 'lose_weight' ? 'Weight Loss' : getRecommendedGoal() === 'gain_weight' ? 'Weight Gain' : 'Weight Maintenance'}</strong>
                  </small>
                )}
              </div>
              <Row>
                <Col>
                  <Form.Check
                    type="radio"
                    id="goal-lose"
                    name="goal"
                    value="lose_weight"
                    label="Lose Weight"
                    checked={formData.goal === 'lose_weight'}
                    onChange={handleChange}
                    className={getRecommendedGoal() === 'lose_weight' ? 'recommended-option' : ''}
                  />
                </Col>
                <Col>
                  <Form.Check
                    type="radio"
                    id="goal-maintain"
                    name="goal"
                    value="maintain"
                    label="Maintain Weight"
                    checked={formData.goal === 'maintain'}
                    onChange={handleChange}
                    className={getRecommendedGoal() === 'maintain' ? 'recommended-option' : ''}
                  />
                </Col>
                <Col>
                  <Form.Check
                    type="radio"
                    id="goal-gain"
                    name="goal"
                    value="gain_weight"
                    label="Gain Weight"
                    checked={formData.goal === 'gain_weight'}
                    onChange={handleChange}
                    className={getRecommendedGoal() === 'gain_weight' ? 'recommended-option' : ''}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Diet Type</Form.Label>
              <Row>
                <Col>
                  <Form.Check
                    type="radio"
                    id="diet-regular"
                    name="diet_type"
                    value="Regular"
                    label="Regular (Omnivore)"
                    checked={formData.diet_type === 'Regular'}
                    onChange={handleChange}
                  />
                </Col>
                <Col>
                  <Form.Check
                    type="radio"
                    id="diet-vegetarian"
                    name="diet_type"
                    value="Vegetarian"
                    label="Vegetarian"
                    checked={formData.diet_type === 'Vegetarian'}
                    onChange={handleChange}
                  />
                </Col>
                <Col>
                  <Form.Check
                    type="radio"
                    id="diet-vegan"
                    name="diet_type"
                    value="Vegan"
                    label="Vegan"
                    checked={formData.diet_type === 'Vegan'}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Allergies (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. peanuts, shellfish, gluten"
              />
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={prevStep}>
                <i className="fas fa-arrow-left me-1"></i> Back
              </Button>
              <Button variant="primary" onClick={nextStep}>
                Next <i className="fas fa-arrow-right ms-1"></i>
              </Button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h4 className="mb-4">Cuisine Preferences</h4>
            
            {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
              <div key={meal} className="mb-4">
                <h5 className="text-capitalize">{meal} Preferences</h5>
                <div className="cuisine-selection">
                  {cuisineOptions.map((cuisine) => (
                    <Button
                      key={cuisine}
                      variant={formData.cuisines[meal].includes(cuisine) ? "primary" : "outline-primary"}
                      className="m-1"
                      onClick={() => handleCuisineChange(meal, cuisine)}
                    >
                      {cuisine}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={prevStep}>
                <i className="fas fa-arrow-left me-1"></i> Back
              </Button>
              <Button 
                variant="success" 
                type="submit" 
                disabled={loading || !formData.goal}
              >
                {loading ? 'Generating Plan...' : 'Generate Meal Plan'}
                {!loading && <i className="fas fa-utensils ms-2"></i>}
              </Button>
            </div>
            
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="user-profile-form">
      <h2 className="text-center mb-4">Create Your Meal Plan</h2>
      
      <div className="progress-container mb-4">
        <ProgressBar>
          <ProgressBar 
            variant={step >= 1 ? "success" : "primary"} 
            now={step >= 1 ? 33.33 : 0} 
            key={1} 
          />
          <ProgressBar 
            variant={step >= 2 ? "success" : "primary"} 
            now={step >= 2 ? 33.33 : 0} 
            key={2} 
          />
          <ProgressBar 
            variant={step >= 3 ? "success" : "primary"} 
            now={step >= 3 ? 33.33 : 0} 
            key={3} 
          />
        </ProgressBar>
        <div className="d-flex justify-content-between mt-2">
          <div className={`step-label ${step >= 1 ? 'active' : ''}`}>Basic Info</div>
          <div className={`step-label ${step >= 2 ? 'active' : ''}`}>Goals & Diet</div>
          <div className={`step-label ${step >= 3 ? 'active' : ''}`}>Cuisines</div>
        </div>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {renderStep()}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserProfileForm; 