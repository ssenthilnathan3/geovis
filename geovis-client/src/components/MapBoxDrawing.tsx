import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { useGeoData } from "@/context/GeoDataContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import IndicationModal from "./Modal";

const FILE_UPLOAD = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/files`

interface MapboxDrawingProps {
  geoData: GeoJSON.FeatureCollection;
}

const MapboxDrawing: React.FC<MapboxDrawingProps> = ({ geoData }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [draw, setDraw] = useState<MapboxDraw | null>(null);
  const [toggleToolbar, setToggleToolbar] = useState(false);
  const { setGeoData } = useGeoData();
  const router = useRouter();
  const { data: session} = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleModalAction = () => {
    setIsModalOpen(false); 
    (modalMessage == "Data saved successfully") ? router.push("/") : router.push("/map"); 
  };


  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYm9rc2IxIiwiYSI6ImNrcTVjaWZwNzEyMzYycG12bDlud2N4dzgifQ.x9WaaDhFembOygQa1gJTcg";

    if (mapContainerRef.current && !map) {
      const newMap = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-v9",
        center: [0, 0],
        zoom: 2,
      });

      const newDraw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          trash: true,
        },
        defaultMode: "simple_select",
      });

      newMap.on("load", () => {
        console.log("Map loaded");
        newMap.addControl(newDraw);
        newMap.addControl(new mapboxgl.NavigationControl(), "top-right");
        setMap(newMap);
        setDraw(newDraw);

        // Attach event listeners after draw is added
        newMap.on("draw.create", updateGeoData);
        newMap.on("draw.delete", updateGeoData);
        newMap.on("draw.update", updateGeoData);

        loadGeoData(newDraw, geoData);
      });
    }

    return () => {
      if (map) map.remove();
    };
  }, []);

  useEffect(() => {
    if (map && draw) {
      loadGeoData(draw, geoData);
    }
  }, [geoData, map, draw]);

  const loadGeoData = (draw: MapboxDraw, data: GeoJSON.FeatureCollection) => {
    if (data && data.features && data.features.length > 0) {
      console.log("Loading geoData:", data);
      draw.deleteAll();
      draw.add(data);
      const bounds = getBounds(data);
      if (bounds && map) {
        map.fitBounds(bounds, { padding: 50 });
      }
    } else {
      setModalMessage("Please upload a valid geojson file")
      setIsModalOpen(true);
      
      console.log("No valid geoData to load");
    }
  };

  const updateGeoData = useCallback(() => {
    if (draw) {
      const newData = draw.getAll();
      console.log("Updating geoData:", newData);
      setGeoData(newData);
    }
  }, [draw, setGeoData]);

  const getBounds = (
    data: GeoJSON.FeatureCollection
  ): mapboxgl.LngLatBounds | null => {
    let bounds = new mapboxgl.LngLatBounds();
    let validBounds = false;

    data.features.forEach((feature) => {
      if (feature.geometry.type === "Polygon") {
        feature.geometry.coordinates[0].forEach((coord) => {
          if (
            Array.isArray(coord) &&
            coord.length >= 2 &&
            !isNaN(coord[0]) &&
            !isNaN(coord[1])
          ) {
            bounds.extend([coord[0], coord[1]] as mapboxgl.LngLatLike);
            validBounds = true;
          }
        });
      } else if (feature.geometry.type === "LineString") {
        feature.geometry.coordinates.forEach((coord) => {
          if (
            Array.isArray(coord) &&
            coord.length >= 2 &&
            !isNaN(coord[0]) &&
            !isNaN(coord[1])
          ) {
            bounds.extend([coord[0], coord[1]] as mapboxgl.LngLatLike);
            validBounds = true;
          }
        });
      }
    });

    return validBounds ? bounds : null;
  };

  const handleSave = useCallback(async () => {
    if (draw) {
      const newData = draw.getAll();
      const geoJsonData = JSON.stringify(newData);
      const base64GeoJson = btoa(geoJsonData);  // Convert string to base64
  
      try {
        // Make the POST request to save the data in the database
        const response = await fetch(FILE_UPLOAD, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`
          },
          body: JSON.stringify({
            file_name: "geo_json",
            file_data: base64GeoJson
          }),
        });
  
        if (!response.ok) {
          setModalMessage("Error saving data")
          setIsModalOpen(true);
          
          throw new Error(`Error saving data: ${response.statusText}`);
        }
  
        const result = await response.json();
        console.log("Data saved successfully:", result);
        setModalMessage("Data saved successfully")
        setIsModalOpen(true);
      } catch (error) {
        console.error("Failed to save data:", error);
      }
    }
  }, [draw]);

  const handleModeChange = useCallback(
    (mode: string) => {
      if (draw) {
        console.log("Changing mode to:", mode);
        if (mode === "direct_select") {
          const selectedFeatures = draw.getSelectedIds();
          if (selectedFeatures.length > 0) {
            draw.changeMode(mode, { featureId: selectedFeatures[0] });
          } else {
            setModalMessage("Please select a feature first")
            setIsModalOpen(true)
            console.log("Please select a feature first");
          }
        } else {
          draw.changeMode(mode);
        }
      } else {
        setModalMessage("Draw object is not initialized")
        setIsModalOpen(true)
        console.log("Draw object is not initialized");
      }
    },
    [draw]
  );

  const mapContainerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100%",
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapContainerRef} style={mapContainerStyle} />
      <div style={controlContainerStyle}>
        <button
          className={
            "bg-white text-yellow-800 font-medium me-2 w-10 h-10 text-xl rounded dark:bg-white dark:text-black"
          }
          onClick={() => router.push("/")}
        >
          🏠
        </button>
        <button
          onClick={() => setToggleToolbar(!toggleToolbar)}
          className={
            "bg-white text-yellow-800 font-medium me-2 w-10 h-10 text-xl rounded dark:bg-white dark:text-black"
          }
        >
          🛠️
        </button>
        <button onClick={handleSave} className="bg-[#86efac] text-yellow-800 font-medium me-2 p-2 h-10 text-xs rounded dark:bg-[#86efac] dark:text-black">
                Save Changes
        </button>
        <div
          className={`transition-all duration-300 ease-in-out transform ${
            toggleToolbar
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }`}
        >
          {toggleToolbar && (
            <div className="flex flex-col transition-all duration-300 ease-in-out pb-2 space-y-1">
              <button
                onClick={() => handleModeChange("simple_select")}
                className={buttonStyle}
              >
                Select
              </button>
              <button
                onClick={() => handleModeChange("draw_point")}
                className={buttonStyle}
              >
                Draw Point
              </button>
              <button
                onClick={() => handleModeChange("draw_line_string")}
                className={buttonStyle}
              >
                Draw Line
              </button>
              <button
                onClick={() => handleModeChange("draw_polygon")}
                className={buttonStyle}
              >
                Draw Polygon
              </button>
              <button
                onClick={() => handleModeChange("direct_select")}
                className={buttonStyle}
              >
                Edit
              </button>
            </div>
          )}
          
        </div>
      </div>
      <IndicationModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen} 
        title=""
        content={[modalMessage]}
        primaryActionLabel="Continue"
        onPrimaryAction={handleModalAction}
      />
    </div>
  );
};

const buttonStyle =
  "bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-3 py-2 rounded dark:bg-yellow-900 dark:text-yellow-300";
const controlContainerStyle: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  left: "10px",
  zIndex: 1,
  display: "flex",
  flexDirection: "row",
  gap: "5px",
} as const;

export default MapboxDrawing;
