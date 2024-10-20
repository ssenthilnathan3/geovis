import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface GeoData {
  type: 'FeatureCollection';
  features: Array<GeoJSON.Feature>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useFetchGeoData = () => {
  const { data: session, status } = useSession();
  const [geoDataList, setGeoDataList] = useState<GeoData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('geoData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setGeoDataList(parsedData);
      } catch (error) {
        console.error("Error parsing stored geoData:", error);
      }
    }

    const fetchGeoDataList = async () => {
      if (!session?.accessToken) {
        console.error("No access token found, cannot fetch geoData list");
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log(session)
      try {
        const response = await fetch(`${BACKEND_URL}/files`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch geoData list: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setGeoDataList(data);
        localStorage.setItem('geoDataList', JSON.stringify(data)); // Store the fetched data
      } catch (error) {
        console.error("Error fetching geoData list from API:", error);
        setError("Failed to fetch geo data.");
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchGeoDataList();
    } else {
      setLoading(false);
    }
  }, [session, status]);

  return { geoDataList, loading, error };
};
