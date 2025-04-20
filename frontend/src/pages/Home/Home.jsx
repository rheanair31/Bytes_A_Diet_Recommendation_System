import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <Container>
        <Row className="align-items-center min-vh-100">
          <Col md={6} className="text-center text-md-start">
            <h1 className="display-4 fw-bold mb-4">Personalized Meal Planning Made Easy</h1>
            <p className="lead mb-4">
              Get customized meal plans based on your dietary preferences, health goals, and lifestyle.
              Start your journey to better eating habits today!
            </p>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/profile')}
              className="me-3"
            >
              Create Your Plan
            </Button>
            <Button 
              variant="outline-primary" 
              size="lg" 
              onClick={() => navigate('/saved-plans')}
            >
              View Saved Plans
            </Button>
          </Col>
          <Col md={6} className="d-none d-md-block">
            {/* <img 
              src="/healthy-food.jpg" 
              alt="Healthy Food" 
              className="img-fluid rounded"
            /> */}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
