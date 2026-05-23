import { useState } from 'react';

export default function useGeolocation() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [error, setError] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setError(true);
      }
    );
  };

  return { userLocation, handleGetLocation, error };
}
