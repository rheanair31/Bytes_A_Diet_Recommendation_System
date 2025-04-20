import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer bg-light mt-5">
      <Container>
        <Row className="py-4">
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-primary mb-3">Bytes Diet Planner</h5>
            <p className="text-muted">
              Your personalized diet planning companion. Get customized meal plans based on your preferences and goals.
            </p>
          </Col>
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-muted">Home</Link></li>
              <li><Link to="/profile" className="text-muted">Create Plan</Link></li>
              <li><Link to="/saved-plans" className="text-muted">Saved Plans</Link></li>
              <li><Link to="/about" className="text-muted">About</Link></li>
            </ul>
          </Col>
          <Col md={3} className="mb-4 mb-md-0">
            <h6 className="mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-muted">Nutrition Guide</a></li>
              <li><a href="#" className="text-muted">Healthy Recipes</a></li>
              <li><a href="#" className="text-muted">Diet Tips</a></li>
              <li><a href="#" className="text-muted">FAQ</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6 className="mb-3">Contact Us</h6>
            <ul className="list-unstyled">
              <li className="text-muted">Email: support@bytesdiet.com</li>
              <li className="text-muted">Phone: (123) 456-7890</li>
            </ul>
          </Col>
        </Row>
        <hr />
        <Row className="py-3">
          <Col className="text-center text-muted">
            <small>© {new Date().getFullYear()} Bytes Diet Planner. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
