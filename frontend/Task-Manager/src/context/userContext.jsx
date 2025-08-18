import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance.js';
import { API_Paths } from '../utils/apiPaths.js';

export const UserContext = createContext();

const UserProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('token');
      
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        // Make sure the token is available for the API call
        const response = await axiosInstance.get(API_Paths.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (error) {
        console.log("User not authenticated", error);
        // Clear invalid token
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Remove user dependency to avoid infinite loops

  const updateUser = (userData) => {
    setUser(userData);
    // Store the token properly - don't stringify if it's already a string
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    setLoading(false);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('token');
    setLoading(false);
  };

  return (
    <UserContext.Provider value={{user, loading, updateUser, clearUser}}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider;