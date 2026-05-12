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
    
    // Poll every 10 seconds to simulate real-time live data
    const intervalId = setInterval(fetchData, 10000);
    
    return () => { 
      mounted = false; 
      clearInterval(intervalId);
    };
  }, [endpoint]);
  
  return data;
}
