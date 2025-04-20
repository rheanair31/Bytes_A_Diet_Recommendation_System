import React, { useState } from 'react';
import { Card, Row, Col, Tab, Nav, Button, Modal, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MealPlanResults = ({ userProfile, mealPlan }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Redirect if no meal plan data
  if (!mealPlan || !userProfile) {
    navigate('/profile');
    return null;
  }

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowModal(true);
  };

  const handleSavePlan = async () => {
    setSavingPlan(true);
    try {
      await axios.post('/api/save-meal-plan', { userProfile, mealPlan });
      setSavingPlan(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      setSavingPlan(false);
    }
  };

  const getMacroPercentages = () => {
    const targets = mealPlan.daily_targets;
    const totalCalories = targets.daily_calories;
    const proteinCalories = targets.protein_g * 4;
    const carbsCalories = targets.carbs_g * 4;
    const fatCalories = targets.fat_g * 9;

    return {
      protein: Math.round((proteinCalories / totalCalories) * 100),
      carbs: Math.round((carbsCalories / totalCalories) * 100),
      fat: Math.round((fatCalories / totalCalories) * 100)
    };
  };

  const macroPercentages = getMacroPercentages();

  const handlePrint = () => {
    window.print();
  };

  // Seasons styling
  const seasonColors = {
    spring: '#8BC34A',
    summer: '#FF9800', 
    fall: '#795548',
    winter: '#42A5F5'
  };
  
  return (
    <div className="meal-plan-results">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Personalized Meal Plan</h2>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2" 
            onClick={handlePrint}
          >
            <i className="fas fa-print me-1"></i> Print
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSavePlan}
            disabled={savingPlan || saveSuccess}
          >
            {savingPlan ? (
              <>Saving <i className="fas fa-spinner fa-spin"></i></>
            ) : saveSuccess ? (
              <>Saved <i className="fas fa-check"></i></>
            ) : (
              <><i className="fas fa-save me-1"></i> Save Plan</>
            )}
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4>Daily Targets</h4>
              <Row>
                <Col sm={6} md={3} className="text-center mb-3">
                  <div className="target-circle">
                    <div className="target-value">{mealPlan.daily_targets.daily_calories}</div>
                  </div>
                  <div className="target-label">Daily Calories</div>
                </Col>
                <Col sm={6} md={3} className="text-center mb-3">
                  <div className="target-circle protein">
                    <div className="target-value">{mealPlan.daily_targets.protein_g}g</div>
                    <div className="target-percent">{macroPercentages.protein}%</div>
                  </div>
                  <div className="target-label">Protein</div>
                </Col>
                <Col sm={6} md={3} className="text-center mb-3">
                  <div className="target-circle carbs">
                    <div className="target-value">{mealPlan.daily_targets.carbs_g}g</div>
                    <div className="target-percent">{macroPercentages.carbs}%</div>
                  </div>
                  <div className="target-label">Carbs</div>
                </Col>
                <Col sm={6} md={3} className="text-center mb-3">
                  <div className="target-circle fat">
                    <div className="target-value">{mealPlan.daily_targets.fat_g}g</div>
                    <div className="target-percent">{macroPercentages.fat}%</div>
                  </div>
                  <div className="target-label">Fat</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4>Profile Summary</h4>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td><strong>Diet:</strong></td>
                    <td>{userProfile.diet_type}</td>
                  </tr>
                  <tr>
                    <td><strong>Goal:</strong></td>
                    <td>
                      {userProfile.goal === 'lose_weight' && 'Weight Loss'}
                      {userProfile.goal === 'maintain' && 'Maintenance'}
                      {userProfile.goal === 'gain_weight' && 'Weight Gain'}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Current Season:</strong></td>
                    <td>
                      <Badge 
                        style={{ 
                          backgroundColor: seasonColors[mealPlan.current_season] || '#6c757d',
                          color: ['summer', 'spring'].includes(mealPlan.current_season) ? '#212529' : '#fff'
                        }}
                      >
                        {mealPlan.current_season.charAt(0).toUpperCase() + mealPlan.current_season.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tab.Container defaultActiveKey="breakfast">
        <Card className="shadow-sm meal-options">
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="breakfast">Breakfast</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="lunch">Lunch</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="dinner">Dinner</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="snack">Snacks</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
                <Tab.Pane eventKey={meal} key={meal}>
                  <div className="text-center mb-3">
                    <Badge bg="info" pill className="px-3 py-2">
                      Target Calories: {mealPlan.meals[meal]?.target_calories || 'N/A'}
                    </Badge>
                  </div>
                  
                  {mealPlan.meals[meal]?.error ? (
                    <div className="alert alert-warning">
                      {mealPlan.meals[meal].error}
                    </div>
                  ) : (
                    <Row>
                      {mealPlan.meals[meal]?.options?.map((food, index) => (
                        <Col md={4} key={index} className="mb-4">
                          <Card 
                            className="h-100 food-card" 
                            onClick={() => handleFoodClick(food)}
                          >
                            <div 
                              className="food-image"
                              style={{ backgroundColor: seasonColors[mealPlan.current_season] || '#f8f9fa' }}
                            >
                              <i className="fas fa-utensils fa-2x"></i>
                            </div>
                            <Card.Body>
                              <Card.Title>{food.food_name}</Card.Title>
                              <Card.Text className="mb-1"></Card.Text>
                              <Card.Text className="mb-1">
                                <div className="macro-badge calories">
                                  <i className="fas fa-fire-alt me-1"></i> {food.calories} cal
                                </div>
                              </Card.Text>
                              <div className="d-flex justify-content-between">
                                <span className="macro-badge protein">
                                  <i className="fas fa-drumstick-bite me-1"></i> {food.protein_g}g
                                </span>
                                <span className="macro-badge carbs">
                                  <i className="fas fa-bread-slice me-1"></i> {food.carbs_g || 'N/A'}g
                                </span>
                                <span className="macro-badge fat">
                                  <i className="fas fa-cheese me-1"></i> {food.fat_g || 'N/A'}g
                                </span>
                              </div>
                              {food.cuisine_type && (
                                <Badge bg="light" text="dark" className="mt-2">
                                  {food.cuisine_type}
                                </Badge>
                              )}
                            </Card.Body>
                            <Card.Footer className="text-center">
                              <small className="text-muted">Click for details</small>  
                            </Card.Footer>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>

      {/* Seasonal Recommendations */}
      <h3 className="mt-5 mb-3">Seasonal Recommendations</h3>
      <Card className="shadow-sm">
        <Card.Body>
          <p className="mb-4">
            These foods are in season during {mealPlan.current_season} and match your dietary preferences:
          </p>
          <Row>
            {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
              <Col md={3} key={`seasonal-${meal}`} className="mb-4">
                <h5 className="text-capitalize">{meal}</h5>
                <div className="seasonal-list">
                  {mealPlan.seasonal_recommendations?.[meal]?.foods?.slice(0, 3).map((food, idx) => (
                    <div key={idx} className="seasonal-item">
                      <i className="fas fa-check-circle me-2" style={{ color: seasonColors[mealPlan.current_season] }}></i>
                      {food.food_name}
                    </div>
                  ))}
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Food Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        {selectedFood && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedFood.food_name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <h5>Nutrition Facts</h5>
                  <Table striped bordered hover size="sm">
                    <tbody>
                      <tr>
                        <th>Calories</th>
                        <td>{selectedFood.calories}</td>
                      </tr>
                      <tr>
                        <th>Protein</th>
                        <td>{selectedFood.protein_g}g</td>
                      </tr>
                      <tr>
                        <th>Carbs</th>
                        <td>{selectedFood.carbs_g || 'N/A'}g</td>
                      </tr>
                      <tr>
                        <th>Fat</th>
                        <td>{selectedFood.fat_g || 'N/A'}g</td>
                      </tr>
                      <tr>
                        <th>Fiber</th>
                        <td>{selectedFood.fiber_g || 'N/A'}g</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Details</h5>
                  <Table striped bordered hover size="sm">
                    <tbody>
                      <tr>
                        <th>Diet Type</th>
                        <td>{selectedFood.diet_type}</td>
                      </tr>
                      <tr>
                        <th>Cuisine</th>
                        <td>{selectedFood.cuisine_type || 'Not specified'}</td>
                      </tr>
                    </tbody>
                  </Table>
                  
                  {selectedFood.allergens && (
                    <div className="mt-3">
                      <h5>Allergens</h5>
                      <p>{selectedFood.allergens}</p>
                    </div>
                  )}
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MealPlanResults; 