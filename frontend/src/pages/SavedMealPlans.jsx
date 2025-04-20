import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SavedMealPlans = () => {
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/saved-meal-plans');
      setSavedPlans(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching saved plans:', err);
      setError('Failed to load saved meal plans. Please try again later.');
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    setDeleteLoading(planId);
    try {
      await axios.delete(`/api/saved-meal-plans/${planId}`);
      setSavedPlans(savedPlans.filter(plan => plan._id !== planId));
      setDeleteLoading(null);
    } catch (err) {
      console.error('Error deleting plan:', err);
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your saved meal plans...</p>
      </div>
    );
  }

  return (
    <div className="saved-meal-plans">
      <h2 className="mb-4">Your Saved Meal Plans</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {savedPlans.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
            <h4>No Saved Meal Plans</h4>
            <p>You haven't saved any meal plans yet.</p>
            <Link to="/profile">
              <Button variant="primary">Create New Meal Plan</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date Created</th>
                  <th>Diet Type</th>
                  <th>Goal</th>
                  <th>Daily Calories</th>
                  <th>Season</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedPlans.map((plan) => (
                  <tr key={plan._id}>
                    <td>{formatDate(plan.createdAt)}</td>
                    <td>
                      <Badge bg={
                        plan.userProfile.diet_type === 'Vegan' ? 'success' :
                        plan.userProfile.diet_type === 'Vegetarian' ? 'info' : 'secondary'
                      }>
                        {plan.userProfile.diet_type}
                      </Badge>
                    </td>
                    <td>
                      {plan.userProfile.goal === 'lose_weight' && 'Weight Loss'}
                      {plan.userProfile.goal === 'maintain' && 'Maintenance'}
                      {plan.userProfile.goal === 'gain_weight' && 'Weight Gain'}
                    </td>
                    <td>{plan.mealPlan.daily_targets.daily_calories} cal</td>
                    <td className="text-capitalize">{plan.mealPlan.current_season}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        as={Link}
                        to={`/meal-plan/${plan._id}`}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeletePlan(plan._id)}
                        disabled={deleteLoading === plan._id}
                      >
                        {deleteLoading === plan._id ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
      
      <div className="text-center mt-4">
        <Link to="/profile">
          <Button variant="primary">
            <i className="fas fa-plus-circle me-2"></i>
            Create New Meal Plan
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SavedMealPlans; 