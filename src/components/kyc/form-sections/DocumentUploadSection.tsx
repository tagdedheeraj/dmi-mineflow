
import React from 'react';
import { FileText } from 'lucide-react';
import ImageUpload from '../ImageUpload';

interface DocumentUploadSectionProps {
  frontImage: File | null;
  frontImagePreview: string | null;
  onFrontImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFrontImage: () => void;
  backImage: File | null;
  backImagePreview: string | null;
  onBackImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearBackImage: () => void;
  selfieImage: File | null;
  selfieImagePreview: string | null;
  onSelfieImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSelfieImage: () => void;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  frontImage,
  frontImagePreview,
  onFrontImageChange,
  onClearFrontImage,
  backImage,
  backImagePreview,
  onBackImageChange,
  onClearBackImage,
  selfieImage,
  selfieImagePreview,
  onSelfieImageChange,
  onClearSelfieImage
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Document Upload
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUpload
          id="frontImage"
          label="Front of ID/Passport"
          image={frontImage}
          imagePreview={frontImagePreview}
          onImageChange={onFrontImageChange}
          onClearImage={onClearFrontImage}
        />
        
        <ImageUpload
          id="backImage"
          label="Back of ID/Passport"
          image={backImage}
          imagePreview={backImagePreview}
          onImageChange={onBackImageChange}
          onClearImage={onClearBackImage}
        />
      </div>
      
      <ImageUpload
        id="selfieImage"
        label="Selfie with ID"
        description="Please take a photo of yourself holding your ID/Passport"
        image={selfieImage}
        imagePreview={selfieImagePreview}
        onImageChange={onSelfieImageChange}
        onClearImage={onClearSelfieImage}
      />
    </div>
  );
};

export default DocumentUploadSection;
