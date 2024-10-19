"use client";

import { UploadComponent } from "@/components/UploadComponent";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGeoData } from '@/context/GeoDataContext';

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { setGeoData } = useGeoData();

  const handleUpload = (data: any) => {
    console.log("Received geoData in parent:", data);
    setGeoData(data);
    router.push('/map');
  };

  return (
    
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-10 justify-self-start">
        Welcome to GeoVis <span className="text-[#ECCF2C]">{session?.user?.name}</span> 🎉
      </h1>
      <UploadComponent onUpload={handleUpload} />
    </div>
    
  );
}
