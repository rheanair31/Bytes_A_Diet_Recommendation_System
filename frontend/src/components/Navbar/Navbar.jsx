import React, { useContext, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';

const Navbar = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { token, setToken } = useContext(StoreContext);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <BootstrapNavbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Link to="/" className="navbar-brand">
          <span className="text-primary fw-bold">Bytes</span> Diet Planner
        </Link>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/profile" className="nav-link">Create Plan</Link>
            <Link to="/saved-plans" className="nav-link">Saved Plans</Link>
            <Link to="/about" className="nav-link">About</Link>
          </Nav>
          <div className="d-flex align-items-center">
            {!token ? (
              <>
                <Button 
                  variant="outline-primary" 
                  className="me-2"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/profile')}
                >
                  Get Started
                </Button>
              </>
            ) : (
              <div className="navbar-profile">
                <img 
                  src="/profile-icon.png" 
                  alt="profile" 
                  className="profile-icon"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                />
                {showProfileDropdown && (
                  <ul className="nav-profile-dropdown">
                    <li onClick={() => navigate('/saved-plans')}>
                      <i className="fas fa-book me-2"></i>
                      <span>Saved Plans</span>
                    </li>
                    <li onClick={() => navigate('/profile')}>
                      <i className="fas fa-user me-2"></i>
                      <span>Profile</span>
                    </li>
                    <hr />
                    <li onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      <span>Logout</span>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
