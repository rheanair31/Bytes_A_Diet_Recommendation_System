import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <Row className="text-center py-5">
        <Col>
          <h1 className="display-4">Your Personalized Diet Recommendation System</h1>
          <p className="lead">
            Get customized meal plans based on your body metrics, goals, and dietary preferences
          </p>
          <Link to="/profile">
            <Button variant="primary" size="lg" className="mt-3">
              Create Your Meal Plan
            </Button>
          </Link>
        </Col>
      </Row>

      <Row className="my-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <i className="fas fa-calculator fa-3x text-primary mb-3"></i>
              <Card.Title>Personalized Calculations</Card.Title>
              <Card.Text>
                We calculate your BMR, TDEE, and macronutrient needs based on your body metrics and goals.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <i className="fas fa-carrot fa-3x text-primary mb-3"></i>
              <Card.Text>
                Choose from multiple diet types including Regular, Vegetarian, and Vegan options.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <i className="fas fa-globe fa-3x text-primary mb-3"></i>
              <Card.Title>Diverse Cuisines</Card.Title>
              <Card.Text>
                Explore meal options from various cuisines around the world that match your preferences.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="my-5">
        <Col md={12}>
          <Card className="bg-light">
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h3>Ready to get started?</h3>
                  <p>
                    Create your personalized meal plan today and start your journey toward a healthier lifestyle.
                  </p>
                </Col>
                <Col md={4} className="d-flex align-items-center justify-content-end">
                  <Link to="/profile">
                    <Button variant="primary">Get Started</Button>
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home; 