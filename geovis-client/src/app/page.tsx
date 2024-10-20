"use client";

import { UploadComponent } from "@/components/UploadComponent";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGeoData } from '@/context/GeoDataContext';
import Link from 'next/link';
import { Avatar } from "@nextui-org/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setGeoData } = useGeoData();

  const handleUpload = (data: any) => {
    console.log("Received geoData in parent:", data);
    setGeoData(data);
    router.push('/map');
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-10 text-center">
        Welcome to GeoVis <span className="text-[#ECCF2C]">{session?.user?.name}</span> 🎉
      </h1>
      <UploadComponent onUpload={handleUpload} />
      <button className="absolute top-0 right-20 mt-6 mr-2 bg-red-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-red-700 transition duration-200" onClick={() => router.push('/logout')}>👋 Logout</button>
      <Link href="/profile" className="absolute top-0 right-10 mt-6 text-blue-500 hover:underline">
        <Avatar name={session?.user?.name} size="md"/>
      </Link>
      

    </div>
  );
}