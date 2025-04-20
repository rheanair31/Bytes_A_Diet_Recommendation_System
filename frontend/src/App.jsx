import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import AboutPage from "./pages/AboutPage";
import UserProfileForm from "./pages/UserProfileForm";
import MealPlanResults from "./pages/MealPlanResults";
import SavedMealPlans from "./pages/SavedMealPlans";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import { Container } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Container className="py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route 
              path="/profile" 
              element={
                <UserProfileForm 
                  setUserProfile={setUserProfile}
                  setMealPlan={setMealPlan}
                />
              } 
            />
            <Route 
              path="/meal-plan" 
              element={
                <MealPlanResults 
                  userProfile={userProfile}
                  mealPlan={mealPlan}
                />
              } 
            />
            <Route path="/saved-plans" element={<SavedMealPlans />} />
          </Routes>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default App;
