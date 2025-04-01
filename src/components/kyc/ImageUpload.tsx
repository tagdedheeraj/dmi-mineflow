
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  id: string;
  label: string;
  description?: string;
  image: File | null;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  id,
  label,
  description,
  image,
  imagePreview,
  onImageChange,
  onClearImage
}) => {
  const imageRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}
      <div className="mt-1">
        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
            <input
              ref={imageRef}
              id={id}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-32 flex flex-col items-center justify-center"
              onClick={() => imageRef.current?.click()}
            >
              <Upload className="h-6 w-6 mb-2" />
              <span>Upload {label}</span>
            </Button>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt={label}
              className="w-full h-32 object-contain border rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={onClearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
