// src/pages/AdminDashboard.js or src/pages/MLAdminPanel.js
import React, { useState, useEffect } from 'react';
import { retrainMLModel, getMLStats } from '../api/recommendations';

function MLAdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getMLStats();
      setStats(response.stats);
    } catch (err) {
      setMessage('Failed to load ML statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setMessage('');
    try {
      const response = await retrainMLModel();
      setMessage('Model retrained successfully');
      // Refresh stats after retraining
      fetchStats();
    } catch (err) {
      setMessage('Failed to retrain model');
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div>
      <h1>ML Recommendation System</h1>
      
      {message && <div className="alert">{message}</div>}
      
      <div className="stats-panel">
        <h2>System Statistics</h2>
        {loading ? (
          <p>Loading statistics...</p>
        ) : stats ? (
          <div>
            <p>User interactions: {stats.interaction_count}</p>
            <p>Active users: {stats.user_count}</p>
            <p>Properties: {stats.property_count}</p>
            <p>Last model training: {stats.model_info.trained_at}</p>
          </div>
        ) : (
          <p>No statistics available</p>
        )}
      </div>
      
      <div className="actions-panel">
        <h2>Model Management</h2>
        <button 
          onClick={handleRetrain} 
          disabled={retraining}
        >
          {retraining ? 'Retraining...' : 'Retrain ML Model'}
        </button>
        <p className="help-text">
          Retraining the model will incorporate the latest user interactions 
          and property data to improve recommendation accuracy.
        </p>
      </div>
    </div>
  );
}

export default MLAdminPanel;