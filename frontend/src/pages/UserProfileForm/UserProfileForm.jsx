import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { StoreContext } from '../../context/StoreContext';
import './UserProfileForm.css';

const UserProfileForm = () => {
  const navigate = useNavigate();
  const { generateMealPlan, loading, error } = useContext(StoreContext);
  
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    weight_kg: '',
    height_cm: '',
    activity_level: 'sedentary',
    goal: 'maintain',
    diet_type: 'balanced',
    allergies: [],
    cuisines: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    }
  });

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Lightly active (1-3 days/week)' },
    { value: 'moderate', label: 'Moderately active (3-5 days/week)' },
    { value: 'very', label: 'Very active (6-7 days/week)' },
    { value: 'extra', label: 'Extra active (very active & physical job)' }
  ];

  const goals = [
    { value: 'lose', label: 'Lose Weight' },
    { value: 'maintain', label: 'Maintain Weight' },
    { value: 'gain', label: 'Gain Weight' }
  ];

  const dietTypes = [
    { value: 'balanced', label: 'Balanced' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' }
  ];

  const commonAllergies = [
    'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 
    'Peanuts', 'Wheat', 'Soy', 'Gluten', 'None'
  ];

  const cuisineTypes = [
    'American', 'Italian', 'Mexican', 'Indian', 'Chinese',
    'Japanese', 'Mediterranean', 'Thai', 'Middle Eastern'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAllergyChange = (allergy) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const handleCuisineChange = (mealType, cuisine) => {
    setFormData(prev => ({
      ...prev,
      cuisines: {
        ...prev.cuisines,
        [mealType]: prev.cuisines[mealType].includes(cuisine)
          ? prev.cuisines[mealType].filter(c => c !== cuisine)
          : [...prev.cuisines[mealType], cuisine]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await generateMealPlan(formData);
      navigate('/meal-plan');
    } catch (err) {
      console.error('Error generating meal plan:', err);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Create Your Diet Profile</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
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
                        min="18"
                        max="100"
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
                        required
                      >
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
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
                        min="30"
                        max="300"
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
                        min="100"
                        max="250"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Activity Level</Form.Label>
                  <Form.Select
                    name="activity_level"
                    value={formData.activity_level}
                    onChange={handleChange}
                    required
                  >
                    {activityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Goal</Form.Label>
                  <Form.Select
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    required
                  >
                    {goals.map(goal => (
                      <option key={goal.value} value={goal.value}>
                        {goal.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Diet Type</Form.Label>
                  <Form.Select
                    name="diet_type"
                    value={formData.diet_type}
                    onChange={handleChange}
                    required
                  >
                    {dietTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Allergies</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {commonAllergies.map(allergy => (
                      <Form.Check
                        key={allergy}
                        type="checkbox"
                        id={`allergy-${allergy}`}
                        label={allergy}
                        checked={formData.allergies.includes(allergy)}
                        onChange={() => handleAllergyChange(allergy)}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Preferred Cuisines</Form.Label>
                  {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                    <div key={mealType} className="mb-2">
                      <h6 className="text-capitalize">{mealType}</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {cuisineTypes.map(cuisine => (
                          <Form.Check
                            key={`${mealType}-${cuisine}`}
                            type="checkbox"
                            id={`${mealType}-${cuisine}`}
                            label={cuisine}
                            checked={formData.cuisines[mealType].includes(cuisine)}
                            onChange={() => handleCuisineChange(mealType, cuisine)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Generating Plan...' : 'Generate Meal Plan'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfileForm; 