import React, { useEffect, useState, createContext } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [userProfile, setUserProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [error, setError] = useState(null);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId] || prev[itemId] === 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: prev[itemId] - 1 };
    });
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axios.get(url + "/api/food/list");
      console.log("Fetched food list:", response.data.data); // Log fetched data
      setFoodList(response.data.data); // Ensure this matches the API response structure
    } catch (error) {
      console.error("Error fetching food list:", error.response ? error.response.data : error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const generateMealPlan = async (profile) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/meal-plans/generate', profile, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMealPlan(response.data);
      setUserProfile(profile);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate meal plan');
      console.error('Error generating meal plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async (plan) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/meal-plans/save', plan, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSavedMealPlans(prev => [...prev, response.data]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save meal plan');
      console.error('Error saving meal plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedMealPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/meal-plans/saved', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSavedMealPlans(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch saved meal plans');
      console.error('Error fetching saved meal plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMealPlan = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:5000/api/meal-plans/saved/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSavedMealPlans(prev => prev.filter(plan => plan._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete meal plan');
      console.error('Error deleting meal plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      }
    };
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    loading, // Add loading to context
    userProfile,
    mealPlan,
    savedMealPlans,
    error,
    generateMealPlan,
    saveMealPlan,
    fetchSavedMealPlans,
    deleteMealPlan
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {loading ? <div>Loading...</div> : props.children} {/* Show loading state */}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
