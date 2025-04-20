import React from 'react';
import { Row, Col, Card, ListGroup } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <div className="about-page">
      <h2 className="mb-4">About The Diet Recommendation System</h2>
      
      <Row className="mb-5">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Our Approach</h4>
              <p>
                The Diet Recommendation System is built with advanced machine learning algorithms that 
                analyze your personal metrics, preferences, and nutritional needs to create customized meal plans.
              </p>
              <p>
                Unlike generic meal plans, our system takes into account:
              </p>
              <ul>
                <li>Your body measurements and activity level</li>
                <li>Personalized goals (weight loss, maintenance, or gain)</li>
                <li>Dietary preferences and restrictions</li>
                <li>Seasonal availability of foods</li>
                <li>Cuisine preferences for each meal type</li>
                <li>Food allergies and sensitivities</li>
              </ul>
              <p>
                Our recommendations are based on scientific principles of nutrition, including the Mifflin-St Jeor 
                Equation for calculating your BMR (Basal Metabolic Rate) and caloric needs.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Key Features</h4>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <i className="fas fa-calculator text-primary me-2"></i>
                  Personalized calorie & macro calculations
                </ListGroup.Item>
                <ListGroup.Item>
                  <i className="fas fa-utensils text-primary me-2"></i>
                  Multiple meal options for each time of day
                </ListGroup.Item>
                <ListGroup.Item>
                  <i className="fas fa-leaf text-primary me-2"></i>
                  Support for various diet types
                </ListGroup.Item>
                <ListGroup.Item>
                  <i className="fas fa-globe text-primary me-2"></i>
                  International cuisine options
                </ListGroup.Item>
                <ListGroup.Item>
                  <i className="fas fa-cloud-sun text-primary me-2"></i>
                  Seasonal food recommendations
                </ListGroup.Item>
                <ListGroup.Item>
                  <i className="fas fa-save text-primary me-2"></i>
                  Save and manage your meal plans
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>How It Works</h4>
              <Row>
                <Col md={4} className="text-center mb-3">
                  <div className="step-circle">1</div>
                  <h5>Create Your Profile</h5>
                  <p>Enter your body metrics, activity level, dietary preferences, and goals.</p>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="step-circle">2</div>
                  <h5>Get Recommendations</h5>
                  <p>Our system analyzes your data and generates personalized meal plans.</p>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="step-circle">3</div>
                  <h5>Track & Adjust</h5>
                  <p>Save your meal plans, track your progress, and adjust as needed.</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="shadow-sm mb-4">
        <Card.Header>
          <h4 className="mb-0">The Science Behind Our Recommendations</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5>BMR Calculation</h5>
              <p>
                We use the Mifflin-St Jeor Equation to calculate your Basal Metabolic Rate (BMR),
                which is the number of calories your body needs to maintain basic functions at rest.
              </p>
              <div className="formula-box">
                <p><strong>For men:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5</p>
                <p><strong>For women:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161</p>
              </div>
            </Col>
            <Col md={6}>
              <h5>Macronutrient Distribution</h5>
              <p>
                Our system recommends an optimal balance of macronutrients based on your goals:
              </p>
              <ul>
                <li><strong>Protein:</strong> 1.6g per kg of body weight</li>
                <li><strong>Fat:</strong> 25% of total calories</li>
                <li><strong>Carbohydrates:</strong> Remaining calories after protein and fat</li>
              </ul>
              <p>
                This distribution is designed to support muscle maintenance, energy levels, and overall health.
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AboutPage; 