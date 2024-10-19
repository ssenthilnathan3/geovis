"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useGeoData } from '@/context/GeoDataContext';
import { Avatar } from "@nextui-org/react";

export default function Profile() {
  const { data: session, status } = useSession();
  const { geoData } = useGeoData(); // Assuming geoData contains the user's uploads
  const [userUploads, setUserUploads] = useState<any[]>([]);

  useEffect(() => {
    if (Array.isArray(geoData) && session) {
        const uploads = geoData.filter((data: any) => data.userId === session.user.id);
        setUserUploads(uploads);
      }
  }, [geoData, session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <section>
    <div className="relative text-4xl font-bold mb-10 top-0 left-0 p-10 w-full bg-gray-100">
        😎 <span className="text-[#ECCF2C]">{session?.user?.name || ""}'s</span>  Profile
    </div>
    <div className="flex flex-col items-start justify-start min-h-screen px-4">
      <div className="flex"><Avatar name={session?.user?.name} size="lg"/><p className="text-2xl mb-4">Welcome, {session?.user?.email}!</p></div>
      <p className="text-2xl mb-4">Welcome, {session?.user?.email}!</p>
      <h3 className="text-xl mb-4">Your Latest Uploads/Edits:</h3>
      {userUploads.length > 0 ? (
        <ul className="list-disc pl-5">
          {userUploads.map((upload, index) => (
            <li key={index} className="mb-2">
              <strong>{upload.title}</strong> - {upload.date} 
            </li>
          ))}
        </ul>
      ) : (
        <p>No uploads found.</p>
      )}
    </div>
    </section>
  );
}