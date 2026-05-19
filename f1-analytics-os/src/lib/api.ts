const API_BASE = "/api";

export async function fetchFromAPI(endpoint: string) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn(`Failed to fetch from ${endpoint}, using fallback data.`);
    return null;
  }
}

import { useState, useEffect } from "react";

export function useApiData<T>(endpoint: string, fallbackData: T): T {
  const [data, setData] = useState<T>(fallbackData);
  
  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      const result = await fetchFromAPI(endpoint);
      if (mounted && result && (Array.isArray(result) ? result.length > 0 : true)) {
        setData(result);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Poll every 60 seconds (daily data, no need for aggressive polling)
    const intervalId = setInterval(fetchData, 60_000);
    
    return () => { 
      mounted = false; 
      clearInterval(intervalId);
    };
  }, [endpoint]);
  
  return data;
}

/**
 * Hook for one-time data fetch (no polling). 
 * Used for data like news/alerts that refresh daily via cron.
 */
export function useLiveData<T>(endpoint: string, fallbackData: T): { data: T; loading: boolean; error: boolean } {
  const [data, setData] = useState<T>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFromAPI(endpoint);
        if (mounted && result) {
          setData(result);
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, [endpoint]);

  return { data, loading, error };
}
