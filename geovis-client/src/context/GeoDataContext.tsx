import React, { createContext, useState, useContext } from 'react';
import { useFetchGeoData } from '@/hooks/useFetchGeoData'; // Import the new hook

interface GeoData {
  type: 'FeatureCollection';
  features: Array<GeoJSON.Feature>;
}

interface GeoDataContextType {
  geoData: GeoData | null;
  geoDataList: GeoData[] | null; // State for the list of geoData from the API
  setGeoData: (data: GeoData | null) => void;
  loading: boolean; // New loading state
  error: string | null; // Error state
}

const GeoDataContext = createContext<GeoDataContextType | undefined>(undefined);

export const GeoDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [geoData, setGeoDataState] = useState<GeoData | null>(null);
  const { geoDataList, loading, error } = useFetchGeoData(); // Use the new hook for fetching

  const setGeoData = (data: GeoData | null) => {
    setGeoDataState(data);
    if (data) {
      localStorage.setItem('geoData', JSON.stringify(data));
    } else {
      localStorage.removeItem('geoData');
    }
  };

  return (
    <GeoDataContext.Provider value={{ geoData, geoDataList, setGeoData, loading, error }}>
      {children}
    </GeoDataContext.Provider>
  );
};

export const useGeoData = () => {
  const context = useContext(GeoDataContext);
  if (context === undefined) {
    throw new Error('useGeoData must be used within a GeoDataProvider');
  }
  return context;
};
