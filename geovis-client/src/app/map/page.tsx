'use client';

import MapboxDrawing from '@/components/MapBoxDrawing'
import React, { useEffect, useState } from 'react'
import { useGeoData } from '@/context/GeoDataContext';
import { useRouter } from 'next/navigation';
import SpinnerComponent from '@/components/SpinnerComponent';

function Map() {
    const { geoData, setGeoData } = useGeoData();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("Initial geoData:", geoData);

        const timer = setTimeout(() => {
            setIsLoading(false);
            if (!geoData) {
                console.log("No geoData found, redirecting to home");
                router.push('/');
            } else {
                console.log("geoData found:", geoData);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [geoData, router]);

    if (!geoData) {
        console.log("geoData is null after loading");
        return null;
    }

    console.log("Rendering MapboxDrawing with geoData:", geoData);

    return (
        <div className="h-screen w-full">
            {isLoading ? <SpinnerComponent/> : <MapboxDrawing geoData={geoData} />}
            
        </div>
    )
}

export default Map
