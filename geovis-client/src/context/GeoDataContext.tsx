import React, { createContext, useState, useContext, useEffect } from 'react';

interface GeoData {
  type: 'FeatureCollection';
  features: Array<GeoJSON.Feature>;
}

interface GeoDataContextType {
  geoData: GeoData | null;
  setGeoData: (data: GeoData | null) => void;
}

const GeoDataContext = createContext<GeoDataContextType | undefined>(undefined);

export const GeoDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [geoData, setGeoDataState] = useState<GeoData | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('geoData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setGeoDataState(parsedData);
      } catch (error) {
        console.error("Error parsing stored geoData:", error);
      }
    } else {
      console.log("No geoData found in localStorage");
    }
  }, []);

  const setGeoData = (data: GeoData | null) => {
    setGeoDataState(data);
    if (data) {
      localStorage.setItem('geoData', JSON.stringify(data));
    } else {
      localStorage.removeItem('geoData');
    }
  };

  return (
    <GeoDataContext.Provider value={{ geoData, setGeoData }}>
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
