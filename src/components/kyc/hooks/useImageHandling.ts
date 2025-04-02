
import { useState, useRef } from 'react';

interface ImageHandlingResult {
  image: File | null;
  imagePreview: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearImage: () => void;
  imageRef: React.RefObject<HTMLInputElement>;
}

export const useImageHandling = (): ImageHandlingResult => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (imageRef.current) {
      imageRef.current.value = '';
    }
  };

  return {
    image,
    imagePreview,
    handleImageChange,
    clearImage,
    imageRef
  };
};
