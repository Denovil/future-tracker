import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

export function useFeatures() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatures = () => {
      setLoading(true);
      setError(null);
      axios
        .get(API_URL)
        .then((res) => setFeatures(res.data))
        .catch((err) => setError('Failed to load features'))
        .finally(() => setLoading(false));
    };
    fetchFeatures();
  }, []);

  return { features, loading, error };
}
