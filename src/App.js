import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './backend/login';
import Register from './backend/register';
import { supabaseClient } from './backend/supabaseClient';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={session ? <Navigate to="/register" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={session ? <Register /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;