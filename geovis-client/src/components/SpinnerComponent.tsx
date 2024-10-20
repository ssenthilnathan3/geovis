import { Spinner } from '@nextui-org/react';
import React from 'react';

function SpinnerComponent() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner label="Please wait while the geospatial data is loading into the map" color="warning" labelColor="warning" />
    </div>
  );
}

export default SpinnerComponent;
