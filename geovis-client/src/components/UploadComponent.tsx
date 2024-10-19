import React, { useState } from 'react';
import { Upload, File } from 'lucide-react';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/react';
import { KmlToGeojson } from 'kml-to-geojson';
import * as fs from 'fs';

export function UploadComponent({ onUpload }: { onUpload: (geoData: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const getFileIcon = () => {
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const handleFileChange = () => {
    if (file) {
      console.log('File selected:', file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          const content = e.target.result;
          console.log('File content loaded');
          let geoData;

          try {
            if (file.name.endsWith('.geojson')) {
              geoData = JSON.parse(content);
              console.log('GeoData parsed successfully:', geoData);
            } else if (file.name.endsWith('.kml')) {
              const kmlParser = new KmlToGeojson();
              const { geojson } = kmlParser.parse(content);
              geoData = geojson;
            } else {
              throw new Error('Unsupported file format');
            }
            console.log('GeoData parsed successfully:', geoData);
            onUpload(geoData);
          } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file. Please check the console for details.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={
          `flex flex-col items-center justify-center w-100 h-54 border-3 border-dashed rounded-xl cursor-pointer ${dragActive ? "border-primary" : "border-gray-300"} bg-gray-50 hover:bg-gray-100 transition-colors duration-300`
        }
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <p className="text-lg font-semibold m-2">Upload your GeoJSON or KML file</p>
        <Input
          id="dropzone-file"
          type="file"
          accept=".geojson,.kml"
          className="hidden"
          onChange={handleChange}
        />
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-full"
        >
          {file ? (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {getFileIcon()}
              <p className="mt-2 text-sm text-gray-500">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
            </div>
          )}
        </label>
      </div>
      
        <div className="mt-4 flex justify-center">
          <Button
            variant="bordered"
            onClick={() => setFile(null)}
            className="mr-2 w-full text-black rounded-full px-6 mt-5 border-2 border-red-300 text-red-500 disabled:bg-white-300 disabled:text-gray-500"
            disabled={!file}
          >
            Clear
          </Button>
          <Button onClick={handleFileChange} className='w-full bg-[#ECCF2C] disabled:bg-gray-300 text-black rounded-full px-6 mt-5' disabled={!file}>Upload</Button>
      </div>
    </div>
  );
  }

