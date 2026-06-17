import { useState } from 'react';

export default function useGeolocation() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation || isLocating) return;

    setErrorMessage('');
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      (e) => {
        if (e.code === 1) {
          setErrorMessage('請重設位置權限後再試一次！');
        } else if (e.code === 3) {
          setErrorMessage('請求超時，請再試一次！');
        } else {
          setErrorMessage('未知錯誤，請稍後再試一次！');
        }
        setIsLocating(false);
      }
    );
  };

  return {
    userLocation,
    handleGetLocation,
    errorMessage,
    isLocating,
    resetErrorState: () => setErrorMessage(''),
  };
}
