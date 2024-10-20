"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useGeoData } from "@/context/GeoDataContext";
import { Avatar } from "@nextui-org/react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export default function Profile() {
  const { data: session, status } = useSession();
  const { geoDataList } = useGeoData(); // Assuming geoData contains the user's uploads
  const [userUploads, setUserUploads] = useState<any[]>([]);
  const [fileData, setFileData] = useState<any[]>([]);
  const router = useRouter()

  useEffect(() => {
    const fetchUserFiles = async () => {
      if (session) {
        try {
          const response = await fetch(`${BACKEND_URL}/files`, {
            method: "GET",
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });

          if (!response.ok) {
            throw new Error(
              `Failed to fetch geoData list: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();
          // Assuming the response contains an array of file objects with base64 data
          const parsedFiles = data.map((file: any) => ({
            title: file.fileName,
            base64Data: file.fileData, // Extract base64 data here
          }));
          setFileData(parsedFiles);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchUserFiles();
  }, [session]);

  useEffect(() => {
    if (Array.isArray(geoDataList) && session) {
      const uploads = geoDataList.filter(
        (data: any) => data.userId === session.user.id
      );
      setUserUploads(uploads);
    }
  }, [geoDataList, session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <section className="relative min-h-screen">
      <div className="relative text-4xl font-bold mb-10 top-0 left-0 p-10 w-full bg-gray-100">
        <Avatar name={session?.user?.name} size="lg" />{" "}
        <span className="text-[#ECCF2C]">{session?.user?.name || ""}'s</span>{" "}
        Profile
      </div>
      <div className="flex flex-col items-start justify-start px-4">

        <h3 className="text-xl mb-4 mt-10">Your Files:</h3>
        {fileData.length > 0 ? (
          <ul className="list-disc pl-5">
            {fileData.map((file, index) => (
              <li key={index} className="mb-2">
                <strong>{file.title}</strong>
                <div>
                  <a
                    href={`data:application/json;base64,${file.base64Data}`}
                    download={`${file.title}.geojson`}
                    className="text-blue-500 hover:underline"
                  >
                    Download File
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No files found.</p>
        )}
      </div>
    </section>
  );
}
