
import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PersonalInfoSection, DocumentUploadSection, PrivacyNotice } from './form-sections';
import { useImageHandling } from './hooks/useImageHandling';

interface KYCFormProps {
  isLoading: boolean;
  onSubmit: (formData: any) => Promise<boolean>;
}

const KYCForm: React.FC<KYCFormProps> = ({ isLoading, onSubmit }) => {
  // Personal information state
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [documentType, setDocumentType] = useState<'government_id' | 'passport'>('government_id');
  const [documentExpiryDate, setDocumentExpiryDate] = useState('');
  
  // Image handling hooks
  const {
    image: frontImage,
    imagePreview: frontImagePreview,
    handleImageChange: handleFrontImageChange,
    clearImage: clearFrontImage,
    imageRef: frontImageRef
  } = useImageHandling();
  
  const {
    image: backImage,
    imagePreview: backImagePreview,
    handleImageChange: handleBackImageChange,
    clearImage: clearBackImage,
    imageRef: backImageRef
  } = useImageHandling();
  
  const {
    image: selfieImage,
    imagePreview: selfieImagePreview,
    handleImageChange: handleSelfieImageChange,
    clearImage: clearSelfieImage,
    imageRef: selfieImageRef
  } = useImageHandling();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!fullName || !idNumber || !address || !documentExpiryDate || !frontImage || !backImage || !selfieImage) {
      alert('Please fill all fields and upload all required images');
      return;
    }
    
    // Submit the form data
    const success = await onSubmit({
      fullName,
      idNumber,
      address,
      documentType,
      documentExpiryDate,
      frontImageUrl: frontImagePreview || '',
      backImageUrl: backImagePreview || '',
      selfieImageUrl: selfieImagePreview || '',
    });
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          KYC Verification
        </CardTitle>
        <CardDescription>
          Complete the form below to verify your identity. This is required to access all features.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <PersonalInfoSection
            fullName={fullName}
            setFullName={setFullName}
            documentType={documentType}
            setDocumentType={setDocumentType}
            idNumber={idNumber}
            setIdNumber={setIdNumber}
            documentExpiryDate={documentExpiryDate}
            setDocumentExpiryDate={setDocumentExpiryDate}
            address={address}
            setAddress={setAddress}
          />
          
          <DocumentUploadSection
            frontImage={frontImage}
            frontImagePreview={frontImagePreview}
            onFrontImageChange={handleFrontImageChange}
            onClearFrontImage={clearFrontImage}
            backImage={backImage}
            backImagePreview={backImagePreview}
            onBackImageChange={handleBackImageChange}
            onClearBackImage={clearBackImage}
            selfieImage={selfieImage}
            selfieImagePreview={selfieImagePreview}
            onSelfieImageChange={handleSelfieImageChange}
            onClearSelfieImage={clearSelfieImage}
          />
          
          <PrivacyNotice />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Submit Verification'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default KYCForm;
